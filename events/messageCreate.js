module.exports = (client, message) => {
    const { prefixes } = require('../data/config.json')
    prefixes.push([`<@${client.user.id}>`, `<@!${client.user.id}>`])

    message.channel.myPermissions = message.guild.me.permissionsIn(message.channel.id)
    
    // Return if bot or no message content
    if (message.author.bot || !message.content) return

    // Check channel permissions
    if (!message.channel.myPermissions.has('SEND_MESSAGES')) return
    
    let args, command;
    
    // Go through prefixes
    for (prefix in prefixes) {
        
        prefix = prefixes[prefix]
        if (message.content.startsWith(prefix)) {
            
            // Remove the prefix from content
            let content = message.content.slice(prefix.length);
            if (!content) return
            
            // Define Arguments
            args = content.split(' ')[1] ? content.split(' ').slice(1) : []
            
            // Find command
            let commandName = content.split(' ')[0].toLowerCase();
            command = client.commands.find(c => c.name == commandName || c.aka.includes(commandName))
            
        }
        
    }
    
    // Run the command
    if (command) {
        if (!message.channel.myPermissions.has('EMBED_LINKS')) return message.channel.send('**I\'m missing Embed Links permission!**')
        const toolbox = {message, args, client}
        command.run(toolbox)
    }
}