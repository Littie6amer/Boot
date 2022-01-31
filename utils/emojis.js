const fetch = require('node-fetch');

async function getEmojiData(emoji, client) {
    let data = emoji.replace("<", "").replace(">", "").split(":")
    if (emoji.match("(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])")?.[0].length && data.length && !data[1]) {
        data = {
            type: "unicode",
            mention: emoji
        }
    } else {
        if (!emoji || !data[1]) return;
        data = {
            type: "custom",
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
        if (client && client.emojis.cache.get(data.id)) data.guildId = client.emojis.cache.get(data.id).guild.id
        if (responce.status != 200) return;
    }
    return data
}

module.exports = { getEmojiData }