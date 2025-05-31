const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

const app = express();

// ===== Discord Bot Setup =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});
client.login(process.env.token);

// ===== MongoDB Connect =====
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('[MongoDB] Connected');
}).catch(console.error);

// ===== View & Middleware =====
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false
}));

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

// ===== Routing =====
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

// Gunakan route terpisah
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);

// ===== Server Start =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
});

// Export agar bisa dipakai di route
module.exports = { app, client };