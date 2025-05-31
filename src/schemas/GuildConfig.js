const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '!' },
    // Tambah config lain di sini
});

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);

