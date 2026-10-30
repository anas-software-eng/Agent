require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
// const Groq = require("groq-sdk");
const authRoutes = require('./src/Routes/auth.route');
const{ createAdmin } = require('./src/Controller/auth.controller');
const taskRoutes = require('./src/Routes/task.route');
const agentRoutes = require('./src/Routes/agent.route');
require("dotenv").config();
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });
const requiredEnv = ['JWT_SECRET', 'MONGO_URI'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}. Check your .env file.`);
  process.exit(1);
}
const app = express();
const port = process.env.PORT || 3300;
// credentials: true is what lets the browser send/receive the auth cookie
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.send('Hello World!');
});
app.use('/api/v1', authRoutes , taskRoutes , agentRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
     await createAdmin();
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
