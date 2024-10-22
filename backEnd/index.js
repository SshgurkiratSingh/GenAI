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

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
