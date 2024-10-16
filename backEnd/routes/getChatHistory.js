const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const multer = require("multer");

// post router at /files which will receive email in body and then send the file names located in files/{email}

// post router at /history which send the file names pressntr at folder /chatHistory/{email}
