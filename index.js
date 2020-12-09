// MAKE SURE TO ADD YOUR MONGODB PATH! It can be found under 'new WOKCommands(client, 'commands) :)
// MAKE SURE TO ADD YOUR BOT'S TOKEN! It can be found under config.json :)

const Discord = require('discord.js')
const client = new Discord.Client()
const WOKCommands = require('wokcommands')
const mongoose = require('mongoose')
const config = require('./config.json')
require('dotenv').config

client.login(config.token)

client.on('ready', () => {
    console.log("The client is now ready.")
    client.user.setPresence({
        activity: {
            name: "I'm a tomato.",
            type: 0
        }
    })
    new WOKCommands(client, 'commands')
    .setMongoPath('mongodb-path')
    .setSyntaxError('Incorrect syntax! Please use {PREFIX}{COMMAND} {ARGUMENTS}')

    .setCategoryEmoji('Fun', '🎮')
    .setCategoryEmoji('Utility', '🛠️')
})
