const { profile: settings, profileName: name } = (require("./configs.js"))
require('dotenv').config({ path: __dirname + "/" + settings.ENV_FILE })

module.exports.botToken = process.env.BOT_TOKEN
module.exports.dbUrl = process.env.DATABASE_URL
module.exports.name = name
module.exports.defaultPrefixes = settings.DEFAULT_PREFIXES
module.exports.shardCount = settings.SHARD_COUNT