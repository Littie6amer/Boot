const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Command } = require("../../utils")

const command = module.exports = new Command()

command
    .create(["embed"], "Create an embed")
    .setExecute(execute)
    .restrict()

function execute(toolbox) {
    const { message, client, args } = toolbox

    if (!args[0].startsWith("<")) return;
    let instructions = args.join(" ").slice(1).split("\n<").map(value => parseValue(value))
    let embed = new MessageEmbed()
    let components = []
    instructions.forEach(instruction => {
        let [command, value] = instruction
        console.log(command, value)
        if (!value) return
        if (command[0] == "title") {
            embed.setTitle(value)
        }

        if (command[0] == "author") {
            if (!command[1]) return
            if (command[1] == "name") {
                embed.setAuthor({ name: value })
            }
            if (command[1] == "icon") {
                embed.setAuthor({ name: embed.author?.name || "No Author Provided", iconURL: value })
            }
        }

        if (command[0] == "description") {
            embed.setDescription(value)
        }

        if (command[0] == "color") {
            embed.setColor(value)
        }

        if (command[0] == "field") {
            if (!command[1]) return
            embed.addField(command.slice(1).join(" "), value)
        }

        if (command[0] == "footer") {
            if (!command[1]) return
            if (command[1] == "text") {
                embed.setFooter({ text: value })
            }
            if (command[1] == "icon") {
                embed.setFooter({ text: embed.footer?.text || "No Footer Provided", iconURL: value })
            }
        }

        if (command[0] == "button") {
            if (!command[1]) return
            if (!components[0]) components[0] = new MessageActionRow()
            if (/^(http|https):\/\/[^ "]+$/.test(command[1])) {
                components[0].addComponents(new MessageButton().setLabel(value).setStyle("LINK").setURL(command[1]))

            } else {
                components[0].addComponents(new MessageButton().setLabel(value).setStyle("PRIMARY").setCustomId("null" + Math.floor(Math.random() * 100)))
            }
        }
    });
    message.reply({ embeds: [embed], components })
}

function parseValue(value) {
    let val = value.split("> ").join(">").split(">")
    val[0] = val[0].split(" ").filter(v => v.length)
    return val
}