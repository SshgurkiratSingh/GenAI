const express = require("express");
const axios = require("axios");
const router = express.Router();
const cors = require("cors");
const {
  SupabaseVectorStore,
} = require("@langchain/community/vectorstores/supabase");
const { OpenAIEmbeddings } = require("@langchain/openai");

const openAIApiKey = process.env.OPENAI_API_KEY2;
const sbUrl = process.env.SUPABASE_URL;
const sbApiKey = process.env.SUPABASE_API_KEY;
const client = createClient(sbUrl, sbApiKey);
async function preprocessAndEmbed(text) {
  const cleanedText = text
    .replace(/\n+/g, " ") // Remove extra newlines
    .replace(/\s\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[^\w\s.,-]/g, "") // Remove special characters except punctuation
    .toLowerCase(); // Convert to lowercase

  return cleanedText;
}

router.post("/uploadAndCreateContext", async (req, res) => {


    
});
