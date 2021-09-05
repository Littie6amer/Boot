const messageCreate = require("../../events/messageCreate")
const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed} = require('discord.js')

module.exports = {
    name: "intro",
    aka: ['help', 'i', 'h'],
    run (toolbox) {
        const {message, client} = toolbox

        const embed = new MessageEmbed()
        .setAuthor(`Welcome to ${client.user.username}`)
        .setThumbnail(client.user.avatarURL())
        .setDescription(`Improve your server with Litties Boot!\n*I am serving **${client.guilds.cache.size-1}** other servers*`)
        .setFooter('Select a page using the dropdown below!')
        .setColor(utils.colors.gold)

        const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('introSelect')
					.setPlaceholder('Select a page..')
					.addOptions([
						{label: 'Page 1', description: 'Utility', value: 'introP1'},
						{label: 'Page 2', description: 'Moderation', value: 'introP2'},
						{label: 'Page 3', description: 'Other', value: 'introP3'}
					]),
			);

        message.channel.send({embeds: [embed], ephemeral: true, components: [row]})
    }
}