const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

class ChatHistoryModule {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  async getFiles(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Please enter an email" });
      }
      const emailDir = path.join(this.baseDir, "files", email);
      const files = await fs.readdir(emailDir);
      return res.status(200).json({ message: "Files found", files });
    } catch (error) {
      next(error); // Pass the error to the error-handling middleware
    }
  }

  async getChatHistory(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Please enter an email" });
      }
      const emailDir = path.join(this.baseDir, "chathistory", email);
      const files = await fs.readdir(emailDir);
      return res.status(200).json({ message: "Files found", files });
    } catch (error) {
      next(error);
    }
  }

  async getChatFile(req, res, next) {
    try {
      const { email, fname } = req.body;
      if (!email || !fname) {
        return res
          .status(400)
          .json({ error: "Please provide email and file name" });
      }
      const filePath = path.join(
        this.baseDir,
        "chathistory",
        email,
        `${fname}.json`
      );
      const data = await fs.readFile(filePath, "utf-8");
      return res.status(200).json(JSON.parse(data));
    } catch (error) {
      next(error);
    }
  }

  async updateChatFile(req, res, next) {
    try {
      const { email, fname, data } = req.body;
      if (!email || !fname || !data) {
        return res
          .status(400)
          .json({
            error: "Please provide email, file name, and data to update",
          });
      }
      const dirPath = path.join(this.baseDir, "chathistory", email);
      const filePath = path.join(dirPath, `${fname}.json`);

      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));

      return res
        .status(200)
        .json({ message: `File ${fname}.json updated successfully` });
    } catch (error) {
      next(error);
    }
  }

  async clearChatFile(req, res, next) {
    try {
      const { email, fname } = req.body;
      if (!email || !fname) {
        return res
          .status(400)
          .json({
            error: "Please provide email and file name to clear content",
          });
      }
      const filePath = path.join(
        this.baseDir,
        "chathistory",
        email,
        `${fname}.json`
      );
      await fs.writeFile(filePath, "[]");
      return res
        .status(200)
        .json({ message: `File ${fname}.json content cleared successfully` });
    } catch (error) {
      next(error);
    }
  }

  async deleteChatFile(req, res, next) {
    try {
      const { email, fname } = req.body;
      if (!email || !fname) {
        return res
          .status(400)
          .json({ error: "Please provide email and file name to delete" });
      }
      const filePath = path.join(
        this.baseDir,
        "chathistory",
        email,
        `${fname}.json`
      );
      await fs.unlink(filePath);
      return res
        .status(200)
        .json({ message: `File ${fname}.json deleted successfully` });
    } catch (error) {
      next(error);
    }
  }
}

// Create an instance of ChatHistoryModule
const chatHistoryModule = new ChatHistoryModule(__dirname);

// Define routes using the router
router.post("/files", chatHistoryModule.getFiles.bind(chatHistoryModule));
router.post(
  "/history",
  chatHistoryModule.getChatHistory.bind(chatHistoryModule)
);
router.post("/chat", chatHistoryModule.getChatFile.bind(chatHistoryModule));
router.post(
  "/updateChat",
  chatHistoryModule.updateChatFile.bind(chatHistoryModule)
);
router.post(
  "/clearChat",
  chatHistoryModule.clearChatFile.bind(chatHistoryModule)
);
router.post(
  "/deleteFile",
  chatHistoryModule.deleteChatFile.bind(chatHistoryModule)
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ error: "An unexpected error occurred" });
});

module.exports = router;
