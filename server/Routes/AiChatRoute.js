const express = require("express");
const { chatWithAI } = require("../Controllers/AiChatController");

const router = express.Router();

router.post("/chat", chatWithAI);

module.exports = router;