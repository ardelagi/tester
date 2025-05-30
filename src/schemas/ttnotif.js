const mongoose = require('mongoose');

const ttNotifSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  tiktokUsername: { type: String, required: true },
  lastPostId: { type: String, default: null }
});

module.exports = mongoose.model('ttnotif', ttNotifSchema);