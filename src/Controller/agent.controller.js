const dotenv = require("dotenv");

const Conversation = require("../model/conver.schema");
const { randomUUID } = require("crypto");
dotenv.config();
const Groq = require("groq-sdk");
const taskSchema = require('../model/task.schema.js');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});



const agentTaskGenerator = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    // 1. Find or create conversation
    const id = conversationId || randomUUID();

    let conversation = await Conversation.findOne({
      conversationId: id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        conversationId: id,
        messages: [],
      });
    }

    // 2. Add user's message to memory
    conversation.messages.push({
      role: "user",
      content: message,
    });

    // 3. Send conversation history to Groq
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful task-management agent. " +
            "Use create_task when the user asks you to create a task.",
        },
        ...conversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "create_task",
            description: "Create and save a task in MongoDB",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Task title",
                },
                description: {
                  type: "string",
                  description: "Task details",
                },
              },
              required: ["title"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const assistantMessage = response.choices[0].message;
    let reply = assistantMessage.content || "";
    let task = null;

    // 4. Execute the AI's tool call
    const toolCall = assistantMessage.tool_calls?.[0];

    if (toolCall?.function.name === "create_task") {
      const args = JSON.parse(toolCall.function.arguments);

      task = await taskSchema.create({
        title: args.title,
        description: args.description || "",
      });

      reply = `Task "${task.title}" created successfully!`;
    }

    // 5. Save assistant response to memory
    conversation.messages.push({
      role: "assistant",
      content: reply,
    });

    await conversation.save();

    // 6. Return conversation ID for future requests
    return res.json({
      conversationId: id,
      reply,
      task,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Agent request failed",
    });
  }
};


module.exports = { agentTaskGenerator };


