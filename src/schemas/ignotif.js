const mongoose = require('mongoose');

const igNotifSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  lastPostId: { type: String, default: null }
});

module.exports = mongoose.model('ignotif', igNotifSchema);