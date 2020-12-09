const Discord = require('discord.js')
const {
    getDefaultFormatCodeSettings
} = require('typescript')
const channelExists = new Set()

module.exports = {
    name: 'vcg',
    description: 'Generate a private channel for you and your friends to enjoy!',
    minArgs: 0,
    maxArgs: 1,
    expectedArgs: '<Member Limit>',
    aliases: ['private', 'channel'],
    category: ['Utility'],
    callback: (message, args) => {
        const author = message.author
        const authorId = message.author.id
        const client = message.client
        const member = message.guild.members.cache.get(message.author.id)
        console.log(member.id)

        // Check if the server had reached it's channel limit (Discord-wise)
        if (message.guild.channels.cache.size >= 99) return message.reply("Unfortunately, this guild had reached it's channel limit, and additional channels will not be able to be created until some are removed. \nCome back later!")

        // Check if user is in a voice channel to move him later
        if (!member.voice.channel) return message.channel.send("You must be in a voice channel to execute this command!")

        // Check if user already has a channel or is on a cooldown
        if (channelExists.has(message.author)) return message.channel.send("You already have a channel created!")

        // Adds user to a cooldown
        channelExists.add(message.author)

        // Creating the Channel
        message.guild.channels
            .create(`${message.author.username}'s Channel`, {
                type: 'voice'
            })
            .then((channel) => {
                const channelEmbed = new Discord.MessageEmbed()
                    .setTitle('Private channel created!')
                    .setDescription(`I have given you a private voice channel for 45 minutes!\nYou now have permissions to add all of your friends and edit the channel through the channel's settings. \n\nHave fun!`)
                    .setColor(3426654)
                message.channel.send(member, channelEmbed)
                const channelId = channel.id
                const categoryId = '758209906427428867' // Put here the Category ID
                channel.setParent(categoryId).then((channel) => {
                    const newChannel = channel
                    if (isNaN(Number(args[0]))) channel.setUserLimit(0) // If user did not mention a number or mentioned an argument that's not a string make channel user limit 0
                    else if (Number(args[0] > 99)) channel.setUserLimit(99) // If Number mentioned is bigger than 99 make channel limit 99 users
                    else channel.setUserLimit(Number(args[0])) // Makes user limit according to mentioned number

                    // Disallows everyone from viewing the channel
                    channel.updateOverwrite(message.guild.id, {
                        VIEW_CHANNEL: false
                    })

                    // Give user permissions
                    channel.updateOverwrite(message.author.id, {
                        VIEW_CHANNEL: true,
                        MANAGE_ROLES: true,
                        MUTE_MEMBERS: true,
                        DEAFEN_MEMBERS: true
                    })

                    // Starts the timer to delete the channel after 45 minutes
                    const timer = setTimeout(() => {

                        // After 45 minutes are up, users will have the ability to regain access to their channel for 10 more minutes. From that point on, that channl cannot be renewed.
                        const Embed = new Discord.MessageEmbed()
                            .setTitle('45 Minutes are up!')
                            .setDescription(`45 Minutes have gone by, and your channel is about to be deleted\n\nIf you'd like to keep your channel, please react to the message now!`)
                            .setColor("RED")
                        message.channel.send(`${member}`, Embed).then(async message => {
                            message.react('✔')
                        
                            const filter2 = (reaction, user) => {
                                return ['✔'].includes(reaction.emoji.name) && user.id === authorId;
                            };
                            try {
                            const collected = await message.awaitReactions(filter2, {
                                    max: 1,
                                    time: 1000 * 60,
                                    errors: ['time']
                                })
                                    const reaction = collected.first();
                                    if (reaction.emoji.name === '✔') {
                                        
                                        clearTimeout(timer2)
                                        const renewedEmbed = new Discord.MessageEmbed()
                                            .setTitle('Renewed!')
                                            .setDescription('I have given you 10 more minutes until your channel will be deleted!')
                                            .setColor(3426654)
                                        message.channel.send(member, renewedEmbed)

                                        setTimeout(() => {
                                            channel.delete()
                                            channelExists.delete(message.author)
                                        }, 1000 * 60 * 10)
                                    }
                            } catch (err) {
                                message.channel.send(`${author} You have failed to respond within 1 minute, therefore your channel was deleted.`)
                                channel.delete()
                                channelExists.delete(message.author)
                            }
                        })
                    }, 1000 * 60 * 45)

                    // Check if everyone had left
                    client.on('voiceStateUpdate', (oldState) => {
                        const {
                            channel
                        } = oldState
                        if (channel && channel.id === channelId && channel.members.size === 0) {
                            newChannel.delete()
                            channelExists.delete(message.author)
                            clearTimeout(timer)
                        }
                    })

                    // Moves the user to the new channel
                    member.voice.setChannel(channel)
                })
            })
    }
}
