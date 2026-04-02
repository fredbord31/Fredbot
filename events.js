// events.js

// This file handles group welcome messages for new members and members leaving

const { Command } = require('your-bot-command-system');

// Welcome message function
function welcomeMember(member) {
    console.log(`Hola viajero del mundo, ${member.username}! Welcome to the group!`);
}

// Farewell message function
function farewellMember(member) {
    console.log(`Adiós we, ${member.username}! We will miss you!`);
}

// Integrating with the bot's command system
Command.on('memberJoin', welcomeMember);
Command.on('memberLeave', farewellMember);

module.exports = { welcomeMember, farewellMember };