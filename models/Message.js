const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Slack user ID
  userName: { type: String }, // Optional: Store Slack username
  message: { type: String, required: true }, // User's message
  response: { type: String, required: true }, // Bot's response
  timestamp: { type: Date, default: Date.now }, // Timestamp of the interaction
});

module.exports = mongoose.model("Message", messageSchema);
