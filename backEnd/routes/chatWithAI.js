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
const { ChatPromptTemplate } = require("@langchain/core/prompts");

// Environment variables
const sbApiKey = process.env.SUPABASE_API_KEY;
const sbUrl = process.env.SUPABASE_URL;
const openAIApiKey = process.env.OPENAI_API_KEY2;

// Validation for environment variables
if (!sbApiKey || !sbUrl || !openAIApiKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const client = createClient(sbUrl, sbApiKey);
const embeddings = new OpenAIEmbeddings({ openAIApiKey });

const systemPrompt = `You are an AI assistant specializing in the analysis of user private data. Your role is to help users understand their requests and provide answers based on their questions, always responding in the specified JSON format, using Markdown for the 'reply' field.

## Capabilities

- Analyzing context
- Answering user requests
- Providing reference metadata from which the user request was generated {provide as much referneces u used to give the answer}
- Suggesting follow-up queries for users

## Response Guidelines

- Use Markdown in the 'reply' field for formatting.
- Avoid using phrases like "I'm an AI" or "As an AI."

# Steps

1. **Analysis**: Thoroughly analyze the user's question and the context provided. Determine if additional context is needed.
2. **Reply Composition**: Compose an informative and helpful reply using Markdown for better clarity and formatting.
3. **Reference Identification**: Identify and include any references that are relevant to the user's question.
4. **Suggested Queries**: Suggest further queries that could help the user explore their question in more depth or reach a better understanding.

# Output Format

Respond in the following JSON format:

{
  "reply": "string (in Markdown)",
  
  "references": [{
    "filename": "string {mentioned in metadata}",
    "page": "number",
    "comment": "string"
  }],
  "suggestedQueries": ["string"]
}

You do not need to mention the reply format as json in reply as it is already understood.

# Notes

- Use 'suggestedQueries' to direct the user's next steps effectively.
- Ensure the reply is concise and relevant to the user's question.`;

let vectorStore;

async function initVectorStore() {
  try {
    console.log("Initializing vector store...");
    if (!vectorStore) {
      vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
        client,
        tableName: "documents",
        queryName: "match_documents",
      });
      console.log("Vector store initialized successfully");
    }
    return vectorStore;
  } catch (error) {
    console.error("Error initializing vector store:", error);
    throw error;
  }
}

async function queryVectorStore(query, k = 3, filter = null) {
  try {
    console.log(`Querying vector store with: "${query}"`);
    const store = await initVectorStore();

    let formattedContext = "";

    for (const file of filter.fileName.$in) {
      const similaritySearchWithScoreResults =
        await store.similaritySearchWithScore(query, k, {
          userEmail: filter.userEmail,
          fileName: file,
        });

      for (const [doc, score] of similaritySearchWithScoreResults) {
        // Create a detailed context entry
        const contextEntry = `
**File Name**: ${doc.metadata.fileName}
**Page**: ${doc.metadata.page || "N/A"}
**Content**: 
\`\`\`
${doc.pageContent}
`;
        formattedContext += contextEntry;
        console.log(`Found context (score: ${score}):\n${contextEntry}\n`);
      }
    }

    return formattedContext.trim();
  } catch (error) {
    console.error("Error querying vector store:", error);
    throw error;
  }
}

const llm = new ChatOpenAI({
  model: "gpt-4o-mini", // Changed from "gpt-4o-mini" to "gpt-4"
  temperature: 0.7,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "{system}"],
  ["human", "Chat History:\n{history}"],
  ["human", "Context:\n{context}"],
  ["human", "User Question: {input}"],
]);

router.get("/", (req, res) => {
  res.json({ message: "Experimental Server for Collab" });
});

router.post("/chat", async (req, res) => {
  try {
    console.log("Received chat request");

    const { message, history, email, selectedFiles, llmModel, contextWindow } =
      req.body;
    console.log(`Selected files: ${JSON.stringify(selectedFiles)}`);
    console.log(`LLM Model: ${llmModel}`);
    console.log(`Context Window: ${contextWindow}`);

    if (!message) {
      console.error("Missing message in request body");
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`Processing request for email: ${email}`);
    console.log(`User message: "${message}"`);

    // Query the vector store for relevant context
    const context = await queryVectorStore(message, contextWindow, {
      userEmail: email,
      fileName: { $in: selectedFiles },
    });

    // Prepare the chat history
    const formattedHistory = history ? history.join("\n") : "";
    console.log("Formatted history:", formattedHistory);

    // Select the appropriate LLM model
    let selectedModel;
    if (llmModel === "GPT-4o") {
      selectedModel = new ChatOpenAI({ temperature: 0.3, model: "gpt-4o" });
    } else {
      selectedModel = new ChatOpenAI({
        temperature: 0.3,
        model: "gpt-4o-mini",
      });
    }

    // Create the chat model with the prepared prompt
    const chain = prompt.pipe(selectedModel);

    console.log("Generating AI response...");
    // Generate the response
    const result = await chain.invoke({
      system: systemPrompt,
      history: formattedHistory,
      context: context,
      input: message,
    });

    console.log("Raw AI response:", result.content);

    // Parse the JSON response
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(result.content);
      console.log(
        "Parsed JSON response:",
        JSON.stringify(jsonResponse, null, 2)
      );
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      return res.status(500).json({ error: "Invalid response format" });
    }

    // Send the response back to the client
    res.json(jsonResponse);
  } catch (error) {
    console.error("Error in chat route:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;
