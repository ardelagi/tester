const mongoose = require("mongoose");

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: "!" },
  logChannel: { type: String, default: null },
  welcomeMessage: { type: Boolean, default: false },
  autoRole: { type: String, default: null }
});

module.exports = mongoose.model("GuildConfig", guildConfigSchema);