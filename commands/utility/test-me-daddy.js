const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const Canvas = require('canvas');
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed, MessageAttachment} = require('discord.js')

const writeContent = (context, text) => {
    const canvas = Canvas.createCanvas(700, 250);
	const con = canvas.getContext('2d');
	con.fontSize = 25

    let y = 140
	let queue = text.split(' ');
    let carryover = "";
    let wordcount = queue.length;

    while (wordcount > 0) {
        while (queue.length) {
            if (con.measureText(queue.join(' ')).width > 240) {
                if (queue.length < 2) {
                    wordcount++
                    queue = [queue[0].slice(0, queue[0].length/2), queue[0].slice(queue[0].length/2, queue[0].length)]
                }
                carryover=[queue.pop(), ...carryover]
            } else {
                context.font = '25px sans-serif';
                context.fillStyle = '#FFFFFF'
                context.fillText(`${queue.join(' ')}`, 105, y);
                wordcount -= queue.length
                y+=30; queue = []
            }
        }
        queue = carryover; carryover = []
    }

	return "balls";
};

const measureContent = async (text) => {
    const canvas = Canvas.createCanvas(700, 250);
	const con = canvas.getContext('2d');
	con.fontSize = 25

    let lines = 0
	let queue = text.split(' ');
    let wordcount = queue.length;
    let carryover = "";
    while (wordcount > 0) {
        while (queue.length) {
            //console.log(con.measureText(queue.join(' ')).width, queue )
            if (con.measureText(queue.join(' ')).width >  240) {
                if (queue.length < 2) {
                    wordcount++
                    queue = [queue[0].slice(0, queue[0].length/2), queue[0].slice(queue[0].length/2, queue[0].length)]
                }
                carryover=[queue.pop(), ...carryover]
            } else {
                lines++
                wordcount -= queue.length
                // console.log(queue)
                queue = []
            }
        }
        queue = carryover; carryover = []
    } 

	return lines;
};

const findHighestColor = async (member) => {
	let roles = []; let color;
    member.roles.cache.forEach(role => {
        roles[role.position] = {color: role.hexColor}
    })

    do {
        let role = roles.pop()
        if (role && role.color != "#000000") {
            color = role.color
        }
    } while (roles.length && !color)

    if (!color) {
        color = 0x0
    }

	return color;
};

module.exports = {
    name: "testmedaddy",
    aka: [],
    description: "Ok",
    args: "",
    async run (toolbox) {
        const {message, client, args} = toolbox
        
        // return console.log(await measureContent(message.content)+' <-- the function returned a value')
        const canvas = Canvas.createCanvas(700, 140+(await measureContent(message.content))*26);
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

		const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
		context.drawImage(avatar, 15, 75, 70, 70);

		const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

		message.reply({ files: [attachment] });
    }
}