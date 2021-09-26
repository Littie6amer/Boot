const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed} = require('discord.js')

module.exports = {
    name: "newpoll",
    aka: ['new-poll', 'np', 'p'],
    description: "Create a poll!",
    args: " [Question] :emoji1: [Option 1] :emoji2: [Option 2] :emoji3: [Option 3]",
    async run (toolbox) {
        const {message, client, args} = toolbox
        
        if (!args[0]) {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('pollSelect')
                        .setPlaceholder('Use a premade poll...')
                        .addOptions([{label: "What pizza toppings do you like?", value: "pizza"}, {label: "What colour do you like?", value: "colours"}, {label: ""}]),
            );
            const embed = await utils.embeds.helpEmbed(this, message, [" Do you like to eat pasta?", " What pizza toppings do you like? :red_circle: Pepperonni :yellow_circle: Just cheese :orange_circle: Chilli"])
            return message.reply({embeds: [embed], components: [row]})
        }
    }
}