const mongoose = require('mongoose');

const guildDataSc = new mongoose.Schema({
  guildId: Number,
  settings: {
      leveling: {
          levelupMessages: {
            type: Boolean,
            default: true
          }
      }
  }
})

module.exports = mongoose.model('guildData', guildDataSc)