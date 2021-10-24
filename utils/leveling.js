const Canvas = require('canvas');

const leveling = []

leveling.resources = {
    "backgroundImages": [
        "https://images.pexels.com/photos/2775196/pexels-photo-2775196.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", // Water Background
        "https://images.pexels.com/photos/66997/pexels-photo-66997.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500", // Air Background
        "https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500", // Ground Background
    ],
    "solidBackgroundColors": [
        "#60cae5", // Blue
        "#e5de60", // Yellow
        "#e5b060", // Orange
        "#93e560" // Green
    ]
}

function getRandomXp () {
    return Math.floor((Math.random()*5)+2)
}

leveling.getRandomXp = getRandomXp

function parseXp(xp) {
    let xpAmounts = [50, 100, 150, 200]
    let level = 0;
    while (xp > xpAmounts[0]) {
        level++; xp -= xpAmounts[0]
        if (xpAmounts[1]) xpAmounts.shift()
    }
    return { level, xp, xpAmounts }
}

leveling.parseXp = parseXp

async function applyBackground(canvas, context, provided) {
    if (provided.startsWith('#')) {
        context.fillStyle = provided
        context.fillRect(0, 0, canvas.width, canvas.height)
    } else {
        const image = await Canvas.loadImage(provided);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
}

leveling.applyBackground = applyBackground

module.exports = leveling