const dotenv = require("dotenv");
dotenv.config();
const Groq = require("groq-sdk");
const taskSchema = require('../model/task.schema.js');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


const agentTaskGenerator = async (req, res) => {
    try {
        const { message } = req.body;

        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful task-management agent. " +
                        "Use create_task when the user asks you to create a task.",
                },
                { role: "user", content: message },
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

        const toolCall = response.choices[0].message.tool_calls?.[0];

        if (toolCall?.function.name === "create_task") {
            const args = JSON.parse(toolCall.function.arguments);

            const task = await taskSchema.create({
                title: args.title,
                description: args.description || "",
            });

            return res.json({
                reply: `Task "${task.title}" created successfully!`,
                task,
            });
        }

        res.json({
            reply: response.choices[0].message.content,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Agent request failed" });
    }
}

module.exports = { agentTaskGenerator };


