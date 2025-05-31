const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twitch = require('./auth/twitch');
const discord = require('./auth/discord');

admin.initializeApp();

exports.twitchCallback = twitch.twitchCallback(admin);
exports.discordCallback = discord.discordCallback(admin);