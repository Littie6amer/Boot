// Rename this file to configs.js

const SELECTED_PROFILE = "template"
const PROFILES = {}

PROFILES["template"] = {
    // The prefixes the bot will use if the server hasn't set any
    DEFAULT_PREFIXES: ["!"],

    // Which env file you would like to use
    ENV_FILE: ".env",

    // The amount of shards that should spawn
    SHARD_COUNT: 1
}

module.exports.profile = PROFILES[SELECTED_PROFILE];
module.exports.profileName = SELECTED_PROFILE