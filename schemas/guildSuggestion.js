const mongoose = require('mongoose');

const guildDataSc = new mongoose.Schema({
    guildId: String,
    messageId: String,
    authorId: String,
    authorTag: String,
    content: String,
    thread: Boolean,
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

module.exports = new mongoose.model('guildsuggestions', guildDataSc)