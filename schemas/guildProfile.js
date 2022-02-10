const mongoose = require('mongoose');

const guildProfileSc = new mongoose.Schema({
  guildId: String,
  userId: String,
  leveling: {
    xp: {
      type: Number,
      default: 0
    },
    lastXpTimestamp: {
      type: Number,
      default: null
    }
  },
  activity: {
    overall: {
      messages: {
        type: Number,
        default: 0
      },
      replies: {
        type: Number,
        default: 0
      },
      spam: {
        type: Number,
        default: 0
      }
    },
    channels: {
      type: Array,
      default: []
    },
    spamTimestamp: {
      type: Number
    },
    spamBuildup: {
      type: Number
    }
  },
  bypass: {
    default: false,
    type: Boolean
  }
})

module.exports = new mongoose.model('guildprofiles', guildProfileSc)