const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const port = 2500;
const morgan = require("morgan");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors()); // Use cors middleware here
app.use(express.json());
app.use(morgan("dev"));
const uploadAndCreateContext = require("./routes/uploadAndCreateContext");
app.use("/upload", uploadAndCreateContext);
const chatWithAI = require("./routes/chatWithAI");
app.use("/chat", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), chatWithAI);
const getChatFiles = require("./routes/getChatHistory");
app.use("/files", getChatFiles);
const chatWithLink = require("./routes/chatWithLink");
app.use("/url", chatWithLink);
app.get("/", (req, res) => {
  res.json({ message: "Experimental Server for Collab" });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
