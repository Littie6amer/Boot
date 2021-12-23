const Canvas = require('canvas');
const { MessageAttachment } = require('discord.js');
const utils = require('../../utils');
const { Command, stringVars } = require('../../utils');
const command = module.exports = new Command()

command.create(["testmedaddy", "test"])
    .setExecute(stringVarTest)

async function execute (toolbox) {
    const { message, args } = toolbox
    const { measureContent, findHighestColor, writeContent } = utils.testmedaddy

    // return console.log(await measureContent(message.content)+' <-- the function returned a value')
    const canvas = Canvas.createCanvas(800, 130 + (await measureContent(message.content)) * 29);
    const context = canvas.getContext('2d');

    // const background = await Canvas.loadImage('./wallpaper.jpg');
    // context.drawImage(background, 0, 0, canvas.width, canvas.height);

    context.fillStyle = '#36393f';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#2f3136"
    context.fillRect(0, 50, canvas.width, 5)

    const channelIcon = await Canvas.loadImage('https://media.discordapp.net/attachments/801524339265503294/868690374028316713/sketch-1627182324756.png?width=538&height=538')
    context.drawImage(channelIcon, 5, 5, 38, 38)

    context.font = '28px sans-serif';
    context.fillStyle = '#ffffff';
    context.fillText(message.channel.name, 45, 33);

    // context.fontSize = 28
    // context.font = '23px sans-serif';
    // context.fillStyle = '#AAAAAA';
    // context.fillText(message.channel.topic, context.measureText(message.channel.name).width+90, 33);

    context.font = '28px sans-serif';
    context.fillStyle = await findHighestColor(message.member)
    context.fillText(`${message.member.displayName}`, 105, 100);

    // context.font = '25px sans-serif';
    // context.fillStyle = '#FFFFFF'
    // context.fillText(`aaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaa`, 110, 120);

    writeContent(context, args.join(' '))

    context.beginPath();
    context.arc(50, 110, 35, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'png' }));
    await context.drawImage(avatar, 15, 75, 70, 70);

    const attachment = new MessageAttachment(canvas.toBuffer(), 'testing.png');

    message.reply({ files: [attachment] });
}

async function stringVarTest (toolbox) {
    const { message, args } = toolbox

    message.channel.send(await stringVars(args.join(' '), {"boomer": "dad?"}))
}