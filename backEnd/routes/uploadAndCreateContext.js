const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const multer = require("multer");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("@langchain/openai");
const {
  SupabaseVectorStore,
} = require("@langchain/community/vectorstores/supabase");
const { createClient } = require("@supabase/supabase-js");
const natural = require("natural");

const openAIApiKey = process.env.OPENAI_API_KEY2;
const sbUrl = process.env.SUPABASE_URL;
const sbApiKey = process.env.SUPABASE_API_KEY;
const client = createClient(sbUrl, sbApiKey);

const upload = multer({ storage: multer.memoryStorage() });

// Function to save the uploaded PDF file
async function savePDF(file, userEmail) {
  if (!file || !file.originalname) {
    throw new Error("Invalid file object: missing originalname property");
  }

  const uploadDir = path.join(__dirname, "files", userEmail);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, file.originalname);
  await fs.promises.writeFile(filePath, file.buffer);
  return filePath;
}

// Function to preprocess and embed text
async function preprocessAndEmbed(text) {
  if (typeof text !== "string") {
    console.error("Invalid input to preprocessAndEmbed:", text);
    return "";
  }
  const cleanedText = text
    .replace(/\n\n+/g, "\n")

    .toLowerCase();

  return cleanedText;
}

// Function to label context
function labelContext(text) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);

  // Simple labeling based on keywords (expand this based on your needs)
  if (tokens.includes("introduction") || tokens.includes("summary")) {
    return "Overview";
  } else if (tokens.includes("method") || tokens.includes("methodology")) {
    return "Methodology";
  } else if (tokens.includes("result") || tokens.includes("findings")) {
    return "Results";
  } else if (tokens.includes("conclusion") || tokens.includes("discussion")) {
    return "Conclusion";
  } else {
    return "No Context";
  }
}

router.post(
  "/uploadAndCreateContext",
  upload.single("file"),
  async (req, res) => {
    try {
      const userEmail = req.body.userEmail;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = await savePDF(file, userEmail);

      // Read and parse PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);

      // Split text into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        separators: ["\n\n", "\n", ". ", "! ", "? "],
        chunkOverlap: 200,
      });

      const chunks = await splitter.createDocuments([pdfData.text]);

      // Process chunks and create documents with metadata
      const processedDocuments = await Promise.all(
        chunks.map(async (chunk, index) => {
          const processed = await preprocessAndEmbed(chunk.pageContent);
          if (typeof processed !== "string") {
            console.error(`Invalid document at index ${index}:`, processed);
          }
          return {
            pageContent: processed,
            metadata: {
              fileName: file.originalname,
              userEmail: userEmail,
              lineNumber: index + 1,
              label: labelContext(chunk.pageContent),
            },
          };
        })
      );

      const validDocuments = processedDocuments.filter(
        (doc) =>
          typeof doc.pageContent === "string" && doc.pageContent.length > 0
      );

      if (validDocuments.length !== processedDocuments.length) {
        console.warn(
          `Filtered out ${
            processedDocuments.length - validDocuments.length
          } invalid documents`
        );
      }

      // Create embeddings and store in Supabase
      await SupabaseVectorStore.fromDocuments(
        validDocuments,
        new OpenAIEmbeddings({ openAIApiKey }),
        {
          client,
          tableName: "documents",
        }
      );

      res.status(200).json({
        message: "File processed and embeddings created successfully",
      });
    } catch (error) {
      console.error("Error processing file:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the file" });
    }
  }
);

module.exports = router;
