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

