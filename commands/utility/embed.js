const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Command } = require("../../utils")

const command = module.exports = new Command()

command
    .create(["embed"], "Create an embed")
    .setPreviewExecute(execute)

function execute(toolbox) {
    const { message, client, args } = toolbox

    if (!args[0].startsWith("!") && !args[0].startsWith("\n!")) return;
    let instructions = args.join(" ").slice(1).split("\n!").map(value => parseValue(value))
    // console.log(instructions)
    let embed = new MessageEmbed()
    let components = []
    const fields = { names: [], text: [] }
    instructions.forEach(instruction => {
        let values = instruction
        // console.log(command)
        if (!values?.length) return
        if (values[0] == "title") {
            embed.setTitle(values.slice(1).join(" "))
        }

        if (values[0] == "author") {
            if (!values[1]) return
            if (values[1] == "name") {
                embed.setAuthor({ name: values.slice(2).join(" ") })
            }
            if (values[1] == "icon") {
                embed.setAuthor({ name: embed.author?.name || "No Author Provided", iconURL: values.slice(2)[0] })
            }
        }

        if (values[0] == "description") {
            embed.setDescription(values.slice(1).join(" "))
        }

        if (values[0] == "color") {
            embed.setColor(values.slice(1)[0])
        }

        if (values[0] == "field") {
            if (!values[1]) return
            if (values[1] == "name") {
                fields.names.push(values.slice(2).join(" "))
            }
            if (values[1] == "value") {
                fields.text.push(values.slice(2).join(" "))
            }
            // embed.addField(command.slice(1).join(" "), value)
        }

        if (values[0] == "footer") {
            if (!values[1]) return
            if (values[1] == "text") {
                embed.setFooter({ text: values.slice(2).join(" ") })
            }
            if (values[1] == "icon") {
                embed.setFooter({ text: embed.footer?.text || "No Footer Provided", iconURL: values.slice(2)[0] })
            }
        }

        // if (command[0] == "button") {
        //     if (!command[1]) return
        //     if (!components[0]) components[0] = new MessageActionRow()
        //     if (/^(http|https):\/\/[^ "]+$/.test(command[1])) {
        //         components[0].addComponents(new MessageButton().setLabel(value).setStyle("LINK").setURL(command[1]))

        //     } else {
        //         components[0].addComponents(new MessageButton().setLabel(value).setStyle("PRIMARY").setCustomId("null" + Math.floor(Math.random() * 100)))
        //     }
        // }
    });

    embed.setFields(fields.names.map(f => ({ name: f, value: fields.text[fields.names.findIndex((n) => n == f)] })).filter(f => f.value))
    message.reply({ embeds: [embed], components })
}

function parseValue(value) {
    let val = value.split(" ")
    //val[0] = val[0].split(" ").filter(v => v.length)
    if (val[0].startsWith("!")) val[0] = val[0].slice(1)
    return val
}