const Discord = require('discord.js')

const embeds = {
  async helpEmbed (command, message, usage) {
    const collection = []
    for (item in usage) {
      collection.push(`\n<:Blank1:801947188590411786><a:check:868670956716052510> \`${require('../data/config.json').prefixes[0]}${command.name}${usage[item]}\``)
    }
    let embed = new Discord.MessageEmbed()
        .setColor('bf943d')
        .setDescription(`\`${require('../data/config.json').prefixes[0]}${command.name}${command.args}\``)
        .addField('Command Function', `<:Blank1:801947188590411786>${command.description}`)
        .addField('Command Usage', `<:Blank1:801947188590411786><a:red_cross:868671069786099752> \`${message.content}\`${collection.join('')}`)
        return embed
  }
}

module.exports = embeds