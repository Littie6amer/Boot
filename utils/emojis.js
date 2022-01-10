const fetch = require('node-fetch');

async function getEmojiData (emoji) {
    if (!emoji) return;
    let data = emoji.replace("<", "").replace(">", "").split(":")
    if (!data[1]) return;
    data = {
        name: data[1],
        id: data[2],
        animated: data[0].length ? true : false,
        URLs: {
            gif: `https://cdn.discordapp.com/emojis/${data[2]}.gif`,
            png: `https://cdn.discordapp.com/emojis/${data[2]}.png`,
            common: data[0].length ? `https://cdn.discordapp.com/emojis/${data[2]}.gif` : `https://cdn.discordapp.com/emojis/${data[2]}.png`
        },
        mention: emoji
    }

    let responce = await fetch(data.URLs.png)
    if (responce.status == 200) return data
}

module.exports = {getEmojiData}