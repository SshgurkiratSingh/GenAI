const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

class ChatHistoryModule {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  async getFiles(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Please enter an email" });
      }
      const emailDir = path.join(this.baseDir, "files", email);
      const files = await fs.readdir(emailDir);
      return res.status(200).json({ message: "Files found", files });
    } catch (error) {
      console.error("Error in getFiles:", error);
      return res.status(500).json({ error: "Could not read email directory" });
    }
  }

  async getChatHistory(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Please enter an email" });
      }
      const emailDir = path.join(this.baseDir, "chathistory", email);
      const files = await fs.readdir(emailDir);
      return res.status(200).json({ message: "Files found", files });
    } catch (error) {
      console.error("Error in getChatHistory:", error);
      return res
        .status(500)
        .json({ error: "Could not read chat history directory" });
    }
  }

  async getChatFile(req, res) {
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
      return res
        .status(200)
        .json({ message: "File found", data: JSON.parse(data) });
    } catch (error) {
      console.error("Error in getChatFile:", error);
      if (error.code === "ENOENT") {
        return res
          .status(404)
          .json({
            error: `File ${fname}.json does not exist for the given email`,
          });
      }
      return res.status(500).json({ error: "Could not read the file" });
    }
  }

  async updateChatFile(req, res) {
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
      console.error("Error in updateChatFile:", error);
      return res.status(500).json({ error: "Could not update the file" });
    }
  }

  async clearChatFile(req, res) {
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
      console.error("Error in clearChatFile:", error);
      if (error.code === "ENOENT") {
        return res
          .status(404)
          .json({
            error: `File ${fname}.json does not exist for the given email`,
          });
      }
      return res
        .status(500)
        .json({ error: "Could not clear the content of the file" });
    }
  }

  async deleteChatFile(req, res) {
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
      console.error("Error in deleteChatFile:", error);
      if (error.code === "ENOENT") {
        return res
          .status(404)
          .json({
            error: `File ${fname}.json does not exist for the given email`,
          });
      }
      return res.status(500).json({ error: "Could not delete the file" });
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
  "/deleteChat",
  chatHistoryModule.clearChatFile.bind(chatHistoryModule)
);
router.post(
  "/deleteFile",
  chatHistoryModule.deleteChatFile.bind(chatHistoryModule)
);

module.exports = router;
