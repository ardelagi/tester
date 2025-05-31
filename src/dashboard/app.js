const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config({ path: '../../.env' });

const app = express();

// Setup Bot Discord.js Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.login(process.env.token);

// Express setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/login', passport.authenticate('discord'));

app.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/dashboard');
});

app.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');

    const botGuilds = client.guilds.cache.map(g => g.id);

    const mutualGuilds = req.user.guilds.filter(guild =>
        botGuilds.includes(guild.id) && (guild.permissions & 0x20)
    );

    res.render('dashboard', {
        user: req.user,
        guilds: mutualGuilds
    });
});

app.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// Jalankan Server
app.listen(3001, () => {
    console.log('Dashboard running at http://localhost:3001');
});

const mongoose = require('mongoose');
const GuildConfig = require('../schemas/GuildConfig'); // Sesuaikan path schema kamu

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.get('/dashboard/:guildId', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');

    const guildId = req.params.guildId;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) return res.send("Bot tidak ada di server ini.");

    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
        config = new GuildConfig({ guildId, prefix: '!' }); // default
        await config.save();
    }

    res.render('guild', {
        user: req.user,
        guild,
        config
    });
});

app.post('/dashboard/:guildId', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');

    const { prefix } = req.body;
    const guildId = req.params.guildId;

    await GuildConfig.findOneAndUpdate(
        { guildId },
        { prefix },
        { upsert: true }
    );

    res.redirect(`/dashboard/${guildId}`);
});
