const mongoose = require('mongoose');

const guildDataSc = new mongoose.Schema({
    guildId: String,
    messageId: String,
    threadId: String,
    authorId: String,
    authorTag: String,
    content: String,
    votes: {
        positive: {
            type: Array,
            default: []
        },
        negative: {
            type: Array,
            default: []
        }
    }
})

module.exports = new mongoose.model('guilddatas', guildDataSc)