const mongoose = require('mongoose');

const guildDataSc = new mongoose.Schema({
  guildId: String,
  leveling: {
    "enabled": {
      type: Boolean,
      default: true,
    },
    "message": {
      "enabled": {
        type: Boolean,
        default: true,
      },
      "channel": {
        type: String,
        default: "ANY",
      },
      "content": {
        type: String,
        default: "**Level up!** {empty} `Level {level.last.number} -> Level {level.new.number}` :sparkles:",
      },
      "embed": {
        type: Boolean,
        default: true,
      },
    },
    "xp": {
      "rate": {
        type: Array,
        default: [2, 5],
      },
      "timeout": {
        type: Number,
        default: 30000,
      },
    }
  },
  activity: {
    "enabled": {
      type: Boolean,
      default: true,
    },
  }
})

module.exports = new mongoose.model('guilddatas', guildDataSc)