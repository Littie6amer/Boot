const { ShardingManager } = require('discord.js');
const utils = require("./utils")

const manager = new ShardingManager('./bot.js', { token: utils.token, totalShards: 2, respawn: true });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn()
