const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const port = 2500;
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors()); // Use cors middleware here
app.use(express.json());
app.use(morgan("dev"));
const uploadAndCreateContext = require("./routes/uploadAndCreateContext");
app.use("/upload", uploadAndCreateContext);
app.use("/file", uploadAndCreateContext); // Add this line for the new delete route

const chatWithAI = require("./routes/chatWithAI");
app.use("/chat", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), chatWithAI);
const getChatFiles = require("./routes/getChatHistory");
app.use("/files", getChatFiles);
app.use("/chat-files", getChatFiles);
app.use(express.static(path.join(__dirname, "routes/files")));
const chatWithLink = require("./routes/chatWithLink");
app.use("/url", chatWithLink);
app.get("/", (req, res) => {
  res.json({ message: "Experimental Server for Collab" });
});
app.get("/list-files/:email", (req, res) => {
  const email = req.params.email;
  const directoryPath = path.join(__dirname, "routes/files", email);

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to list files" });
    }

    res.json(files);
  });
});
// New DELETE route to delete a file
app.delete("/file/delete/:email/:fileName", async (req, res) => {
  const email = req.params.email;
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "routes/files", email, fileName);

  try {
    // Attempt to unlink (delete) the file
    await fs.promises.unlink(filePath);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({ error: "File not found" });
    } else if (err.code === "EACCES") {
      return res.status(403).json({ error: "Permission denied" });
    } else {
      // Log the error for debugging (optional)
      console.error("Error deleting file:", err);
      return res.status(500).json({ error: "Failed to delete file" });
    }
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
