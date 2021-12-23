const Canvas = require('canvas');

async function measureContent (text) {
    const canvas = Canvas.createCanvas(700, 200);
    const con = canvas.getContext('2d');
    con.fontSize = 25
    
    let lines = 0
    let queue = text.split(' ');
    let wordcount = queue.length;
    let carryover = "";
    while (wordcount > 0) {
        while (queue.length) {
            //console.log(con.measureText(queue.join(' ')).width, queue )
            if (con.measureText(queue.join(' ')).width > 240) {
                if (queue.length < 2) {
                    wordcount++
                    queue = [queue[0].slice(0, queue[0].length / 2), queue[0].slice(queue[0].length / 2, queue[0].length)]
                }
                carryover = [queue.pop(), ...carryover]
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
}

async function writeContent (context, text) {
    const canvas = Canvas.createCanvas(700, 200);
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
                    queue = [queue[0].slice(0, queue[0].length / 2), queue[0].slice(queue[0].length / 2, queue[0].length)]
                }
                carryover = [queue.pop(), ...carryover]
            } else {
                context.font = '25px sans-serif';
                context.fillStyle = '#FFFFFF'
                context.fillText(`${queue.join(' ')}`, 105, y);
                wordcount -= queue.length
                y += 30; queue = []
            }
        }
        queue = carryover; carryover = []
    }
    
    return "balls";
};

async function findHighestColor (member) {
    let roles = []; let color;
    member.roles.cache.forEach(role => {
        roles[role.position] = { color: role.hexColor }
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

module.exports = {measureContent, writeContent, findHighestColor}