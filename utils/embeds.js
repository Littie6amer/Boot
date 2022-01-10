const Discord = require('discord.js')

const embeds = {
  async simpleUsageEmbed (command, usage) {
    let embed = new Discord.MessageEmbed()
        .setColor('BLURPLE')
        .setAuthor({ name: `${command.names[0].slice(0,1).toUpperCase()+command.names[0].slice(1,command.names[0].length)} command`, iconURL: `` })
        .setDescription(`${command.description}`)
        .addField("\u200b", `<:blue_dot:929844359812231208> \`${require(".").prefixes[0]}${command.names[0]}${usage}\``)
        return embed
  },
  async subCommandList (command, list) {
    const usage = []
    Object.keys(list).forEach(l => {
      usage.push({ name: "\u200b", value: `<:blue_dot:929844359812231208> \`${require(".").prefixes[0]}${command.names[0]} ${list[l].join(`\`\n<:blue_dot:929844359812231208> \`${require(".").prefixes[0]}${command.names[0]} `)}\``, inline: true})
    });
    let embed = new Discord.MessageEmbed()
        .setColor('BLURPLE')
        .setAuthor({ name: `${command.names[0].slice(0,1).toUpperCase()+command.names[0].slice(1,command.names[0].length)} command`, iconURL: `` })
        .setDescription(`${command.description}`)
        .addFields(usage)
        return embed
  }
}

module.exports = embeds