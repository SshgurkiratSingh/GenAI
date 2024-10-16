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
const { ChatOpenAI } = require("@langchain/openai");
const openAIApiKey = process.env.OPENAI_API_KEY;
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

// Function to extract text from PDF using pdf-parse
async function extractTextFromPDF(filePath) {
  let dataBuffer = fs.readFileSync(filePath);

  try {
    let data = await pdf(dataBuffer);
    console.log("Extracted Text:", data.text); // PDF text content
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

// Function to preprocess text
function preprocessText(text) {
  if (typeof text !== "string") {
    console.error("Invalid input to preprocessText:", text);
    return "";
  }
  // Remove extra whitespace while preserving original content
  return text.replace(/\s+/g, " ").trim();
}

// Function to label context
function labelContext(text) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());

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
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.7,
  // other params...
});

async function generateQuestions(textChunk) {
  // convert textChunk into aprropriate string formatting

  try {
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini", // You can change this to gpt-4-turbo, gpt-4o-mini, etc.
      openAIApiKey,
    });

    const prompt = `
    You are a question generation assistant. Given the following text content, provide 5 questions that a student or a researcher might ask to deepen their understanding of the content. 
    Ensure that the output is formatted as valid JSON. 

    Text content: "${JSON.stringify(textChunk)}" 

    Please return the response in the following JSON format: 
    {
      "questions": [
        "question1",
        "question2",
        "question3",
        "question4",
        "question5"
      ],
      "title": "Appropriate title according to the text content"
    }
      Your output donot need to include ur format type , it should be a json 
  `;
    console.log("Prompt:", prompt);
    const response = await llm.invoke(prompt);
    return response;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

router.post(
  "/uploadAndCreateContext",
  upload.single("file"),
  async (req, res) => {
    console.log("Start processing the request..."); // Log request start
    const startTime = Date.now(); // For performance tracking

    try {
      const userEmail = req.body.email; // Ensure this matches your frontend
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log(
        `Processing file upload for user: ${userEmail}, file: ${file.originalname}`
      );

      // Step 1: Save PDF to the server
      const filePath = await savePDF(file, userEmail);
      console.log(`File saved at path: ${filePath}`);

      // Step 2: Extract text from the PDF
      const extractedText = await extractTextFromPDF(filePath);
      console.log(`Extracted ${extractedText.length} characters from the PDF`);

      if (!extractedText) {
        return res
          .status(500)
          .json({ error: "Failed to extract text from PDF" });
      }

      // Step 3: Split the text into chunks
      console.log("Splitting the extracted text into chunks...");
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        separators: ["\n\n", "\n", ". ", "! ", "? "],
        chunkOverlap: 200,
      });
      const chunks = await splitter.createDocuments([extractedText]);

      // Validate the chunking process
      if (!chunks || chunks.length === 0) {
        return res
          .status(500)
          .json({ error: "Failed to split text into chunks" });
      }
      console.log(`Created ${chunks.length} chunks from the extracted text`);

      // Step 4: Process each chunk, preprocess the text, and apply labels
      const processedDocuments = chunks.map((chunk, index) => {
        const preprocessedText = preprocessText(chunk.pageContent);
        const label = labelContext(preprocessedText);
        console.log(`Chunk ${index + 1} labeled as: ${label}`);

        return {
          pageContent: preprocessedText,
          metadata: {
            fileName: file.originalname,
            userEmail: userEmail,
            lineNumber: index + 1,
            label: label,
          },
        };
      });

      const validDocuments = processedDocuments.filter(
        (doc) =>
          typeof doc.pageContent === "string" && doc.pageContent.length > 0
      );

      console.log(
        `Filtered valid documents: ${validDocuments.length}/${processedDocuments.length}`
      );

      // Step 5: Create embeddings and store in Supabase
      console.log("Creating embeddings and storing them in Supabase...");
      await SupabaseVectorStore.fromDocuments(
        validDocuments,
        new OpenAIEmbeddings({ openAIApiKey }),
        {
          client,
          tableName: "documents",
        }
      );
      console.log("Embeddings successfully created and stored");

      // Step 6: Query the vector store for context
      console.log("Querying vector store for random context...");
      const context = await queryVectorStore(
        "question, result, conclusion ,summary , index, introduction,",
        7,
        {
          userEmail: userEmail,
          fileName: file.originalname,
        }
      );

      // Step 7: Generate questions based on the context
      console.log("Generating questions from the context...");
      const questions = await generateQuestions(context);
      console.log(`Generated questions: ${JSON.stringify(questions)}`);

      const totalTime = Date.now() - startTime;
      console.log(`Total processing time: ${totalTime}ms`);
      console.log(file.originalname);
      // Send success response
      res.status(200).json({
        message: "File processed and embeddings created successfully",
        llm: JSON.parse(questions.content),
        processingTime: `${totalTime} ms`,
        fileName: file.originalname,
        userEmail: userEmail,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({
        error: "An error occurred while processing the file",
        details: error.message,
      });
    }
  }
);

router.get("/", (req, res) => {
  res.json({ message: "Experimental Server for Collab" });
});
router.get("/getContext", async (req, res) => {
  try {
    const query = req.query.query;
    const result = await queryVectorStore(query); // Renamed 'res' to 'result'
    res
      .status(200)
      .json({ message: "Query processed successfully", result: result });
  } catch (error) {
    console.error("Error querying vector store:", error);
    res
      .status(500)
      .json({ error: "An error occurred while querying the vector store" });
  }
});

let vectorStore;
const embeddings = new OpenAIEmbeddings({ openAIApiKey });

async function initVectorStore() {
  if (!vectorStore) {
    vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });
  }
  return vectorStore;
}
async function queryVectorStore(query, k = 5, filter = null) {
  const store = await initVectorStore();

  const similaritySearchWithScoreResults =
    await store.similaritySearchWithScore(query, k, filter);

  for (const [doc, score] of similaritySearchWithScoreResults) {
    console.log(`*${doc.pageContent} [${JSON.stringify()}]`);
  }
  return similaritySearchWithScoreResults;
}

module.exports = router;
