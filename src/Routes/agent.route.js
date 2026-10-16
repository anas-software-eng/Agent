const express = require("express");
const {agentTaskGenerator} = require("../Controller/agent.controller.js");
const router = express.Router();
router.post("/chat", agentTaskGenerator);
module.exports = router;