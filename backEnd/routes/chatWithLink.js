const express = require("express");
const fs = require("fs").promises;
const path = require("path");

// Import LangChain WebBrowser and OpenAI tools
const { WebBrowser } = require("langchain/tools/webbrowser");
const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");

const router = express.Router();

// Define POST route for querying the web
router.post("/ask-from-url", async (req, res) => {
  try {
    // Extract URL and question from the request body
    const { url, question } = req.body;

    if (!url || !question) {
      return res.status(400).json({ error: "URL and question are required" });
    }

    // Check for Azure OpenAI API usage and fail fast
    if (process.env.AZURE_OPENAI_API_KEY) {
      throw new Error(
        "Azure OpenAI API does not support embedding with multiple inputs yet"
      );
    }

    // Initialize the model and embeddings
    const model = new ChatOpenAI({ temperature: 0 });
    const embeddings = new OpenAIEmbeddings(
      process.env.AZURE_OPENAI_API_KEY
        ? { azureOpenAIApiDeploymentName: "Embeddings2" }
        : {}
    );

    // Initialize WebBrowser tool with model and embeddings
    const browser = new WebBrowser({ model, embeddings });

    // Invoke the browser tool with the given URL and question
    const result = await browser.invoke(`"${url}","${question}"`);
    console.log(result);

    // Send the result back to the client
    res.json({ answer: result });
  } catch (error) {
    // Handle any errors that may occur
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
