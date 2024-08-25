import express from "express";
import Chat from "../models/Chat.js";
import ChatMember from "../models/ChatMember.js";
import Message from "../models/Message.js";
import isAuth from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/:chatId", isAuth, upload.single("file"), async (req, res) => {
  try {
    // req.body - type, content
    const membership = await ChatMember.findOne({
      user: req.user._id,
      chat: req.params.chatId,
    });

    if (!membership)
      return res.status(400).json({ msg: "You are not a member of this chat" });

    const messageData = {
      user: req.user._id,
      chat: req.params.chatId,
      ...req.body,
    };

    if (req.file) {
      messageData.file = { name: req.file.filename, size: req.file.size };
    }

    const message = await Message.create(messageData);

    const chat = await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: message._id,
    }).populate("members");

    return res.json({ message, chat });
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }
});

router.put("/:id", isAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || message.user.toString() != req.user._id)
      return res.status(400).json({ msg: "You can't edit this message" });

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true }
    ).populate({
      path: "chat",
      populate: {
        path: "members",
      },
    });

    return res.json({ updatedMessage, chat: updatedMessage.chat });
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.delete("/:id", isAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || message.user.toString() != req.user._id)
      return res.status(400).json({ msg: "You can't delete this message" });

    const chat = await Chat.findById(message.chat).populate("members");

    if (message.file) {
      const filePath = path.join(__dirname, "../public", message.file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }
    await Message.findByIdAndDelete(req.params.id);

    return res.json({ msg: "Deleted message", chat });
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.get("/:chatId", isAuth, async (req, res) => {
  try {
    const membership = await ChatMember.findOne({
      user: req.user._id,
      chat: req.params.chatId,
    });

    if (!membership)
      return res.status(400).json({ msg: "You are not a member of this chat" });

    const messages = await Message.find({ chat: req.params.chatId })
      .sort({
        create_at: "desc",
      })
      .populate("user")
      .populate({
        path: "reply",
        populate: {
          path: "user",
        },
      })
      .lean();

    messages.forEach((message) => {
      message.fromCurrentUser =
        message.user._id.toString() === req.user._id.toString();
    });

    return res.json(messages);
  } catch (e) {
    return res.status(400).json(e);
  }
});

export default router;
