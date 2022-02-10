const SELECTED_PROFILE = "recent branch"
const PROFILES = {}

PROFILES["release branch"] = {
    // The prefixes the bot will use if the server hasn't set any
    DEFAULT_PREFIXES: ["!!", "boot"],

    // Which env file you would like to use
    ENV_FILE: "release.env",

    // The amount of shards that should spawn
    SHARD_COUNT: 2
}

PROFILES["recent branch"] = {
    // The prefixes the bot will use if the server hasn't set any
    DEFAULT_PREFIXES: ["??", "red"],

    // Which env file you would like to use
    ENV_FILE: "recent.env",

    // The amount of shards that should spawn
    SHARD_COUNT: 1
}

module.exports.profile = PROFILES[SELECTED_PROFILE];
module.exports.profileName = SELECTED_PROFILE