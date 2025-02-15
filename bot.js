require("dotenv").config();
const { App } = require("@slack/bolt");
const { Configuration, OpenAIApi, default: OpenAI } = require("openai");
const mongoose = require("mongoose");
const Message = require("./models/Message"); // Import Message schema

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Initialize Slack App with Socket Mode
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_LEVEL_TOKEN,
});

// OpenAI API setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Listen for messages
app.message(async ({ message, say }) => {
  console.log(message);
  if (message.subtype) return; // Ignore bot messages

  const userMessage = message.text;
  const userId = message.user;
  const userName = message.username || "Unknown User"; // Optional username

  console.log(message);

  try {
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: userMessage }],
    });

    console.log(gptResponse.data);

    const botResponse = gptResponse.data.choices[0].message.content;

    // Save to MongoDB
    await Message.create({
      userId: userId,
      userName: userName,
      message: userMessage,
      response: botResponse,
    });

    // Reply to user
    await say(botResponse);
    console.log(botResponse);
  } catch (error) {
    console.error("Error with AI:", error);
    await say("Sorry, I'm having trouble responding right now.");
  }
});

// Start Slack bot with Socket Mode
(async () => {
  await app.start();
  console.log("🚀 Slack bot is running in Socket Mode!");
})();
