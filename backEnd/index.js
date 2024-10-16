const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const port = 2500;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors()); // Use cors middleware here
app.use(express.json());

const uploadAndCreateContext = require("./routes/uploadAndCreateContext");
app.use("/upload", uploadAndCreateContext);

app.get("/", (req, res) => {
  res.json({ message: "Experimental Server for Collab" });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
