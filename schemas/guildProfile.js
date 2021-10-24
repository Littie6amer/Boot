const mongoose = require('mongoose');

const guildProfileSc = new mongoose.Schema({
  guildId: Number,
  userId: Number,
  leveling: {
      xp: Number,
      level: Number,
      messages: Number,
      lastXpTimestamp: Number
  },
  activity: JSON
})

module.exports = mongoose.model('guildProfiles', guildProfileSc)