const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/login', passport.authenticate('discord'));

router.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    console.log('[DEBUG] User after login:', req.user); // debug output
    res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

module.exports = router;