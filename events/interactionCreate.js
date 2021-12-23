const config = require('../data/config.json')
const guildDataSc = require('../schemas/guildData')
const guildProfileSc = require('../schemas/guildProfile')

module.exports = async (client, interaction) => {

    let guildData = await guildDataSc.findOne({
        guildId: interaction.guild.id,
    })

    let userGuildProfile = await guildProfileSc.findOne({
        guildId: interaction.guild.id,
        userId: interaction.member.id
    })

    if (!guildData) {
        guildData = await guildDataSc.create({
            guildId: interaction.guild.id
        })
    }

    if (!userGuildProfile) userGuildProfile = await guildProfileSc.create({
        guildId: interaction.guild.id,
        userId: interaction.member.id,
    })

    const toolbox = { interaction, client, guildData, userGuildProfile, message: interaction.message }

    const buttons = Array.from(client.buttons, ([id, data]) => (data.id = id, data))
    const slashCommands = client.slashCommands
    let options = []

    Object.keys(client.dropDowns).forEach(d => {
        options = [...options, ...Array.from(client.dropDowns[d], ([value, data]) => (data.value = value, data.id = d, data))]
    })

    const selected = []
    let msg;

    if (interaction.isButton()) {
        buttons.forEach(b => {
            let hasToBeTrue = (interaction.customId == b.id) && b.checkExact
            hasToBeTrue = hasToBeTrue || interaction.customId.startsWith(b.id) && !b.checkExact

            if (hasToBeTrue) {
                selected.push(b)
            }
        })

        msg = `[${config.name} - MISSING]: Interaction (button) with customId "${interaction.customId}" wasn't registered!`
    }

    if (interaction.isSelectMenu()) {
        options.forEach(o => {
            let hasToBeTrue = o.checkExact && o.id == interaction.customId
            hasToBeTrue = hasToBeTrue || !o.checkExact && interaction.customId.startsWith(o.id)
            hasToBeTrue = hasToBeTrue && interaction.values.includes(o.value) || hasToBeTrue && o.value == "WILDCARD"

            if (hasToBeTrue) {
                selected.push(o)
            }
        })

        msg = `[${config.name} - MISSING]: Interaction (dropDown) with customId "${interaction.customId}" wasn't registered!`
    }

    if (interaction.isCommand()) {
        selected.push(slashCommands.find(c => c.name.toLowerCase() == interaction.commandName.toLowerCase()))

        msg =  `[${config.name} - MISSING]: Interaction (slashCommand) with commandName "${interaction.commandName}" wasn't registered!`
    }

    if (!selected.length && msg || !selected[0] && msg) {
        console.log(msg)
        interaction.reply({ content: `\`\`\`${msg}\`\`\``, ephemeral: true })
    }

    if (selected.length && selected[0]) {
        if (!interaction) return
        selected[0].execute(toolbox)
    }
}