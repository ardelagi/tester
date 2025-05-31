const express = require('express');
const router = express.Router();
const GuildConfig = require('../../schemas/GuildConfig');
const { client } = require('../app'); // kita export bot client dari app.js

// Middleware: cek login
function isAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Daftar Guild
router.get('/', isAuth, (req, res) => {
    const botGuilds = client.guilds.cache.map(g => g.id);
    const mutualGuilds = req.user.guilds.filter(guild =>
        botGuilds.includes(guild.id) && (guild.permissions & 0x20)
    );

    res.render('dashboard', {
        user: req.user,
        guilds: mutualGuilds
    });
});

// Halaman Konfigurasi Guild
router.get('/:guildId', isAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.send("Bot tidak tergabung di server ini.");

    let config = await GuildConfig.findOne({ guildId: guild.id });
    if (!config) {
        config = new GuildConfig({ guildId: guild.id, prefix: '!', welcomeMessage: false });
        await config.save();
    }

    res.render('guild', {
        user: req.user,
        guild,
        config
    });
});

// Simpan Konfigurasi
router.post('/:guildId', isAuth, async (req, res) => {
    const { prefix, logChannel, welcomeMessage, autoRole } = req.body;
    await GuildConfig.findOneAndUpdate(
        { guildId: req.params.guildId },
        {
            prefix,
            logChannel,
            welcomeMessage: welcomeMessage === 'on',
            autoRole
        },
        { upsert: true }
    );

    res.redirect(`/dashboard/${req.params.guildId}`);
});

module.exports = router;