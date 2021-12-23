const Discord = require('discord.js')

const embeds = {
  async simpleUsageEmbed (command, usage) {
    let embed = new Discord.MessageEmbed()
        .setColor('bf943d')
        .setAuthor(`${command.names[0]} command`.toUpperCase())
        .setDescription(command.description)
        .addField("COMMAND USAGE", `<:smallboot:901130192007864350> \`${require('../data/config.json').prefixes[0]}${command.names[0]}${usage}\``)
        return embed
  },
  async subCommandList (command, list) {
    const lists = []
    Object.keys(list).forEach(l => {
      lists.push({name: l.toUpperCase(), value: `<:smallboot:901130192007864350> \`${command.names[0]} ${list[l].join(`\`\n<:smallboot:901130192007864350> \`${command.names[0]} `)}\``})
    });
    let embed = new Discord.MessageEmbed()
        .setColor('bf943d')
        .setAuthor(`${command.names[0]} command`.toUpperCase())
        .setDescription(command.description)
        .addFields(lists)
        return embed
  }
}

module.exports = embeds