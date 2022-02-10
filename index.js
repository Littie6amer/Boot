const { ShardingManager } = require('discord.js');
const process_settings = require("./process-settings")

const manager = new ShardingManager('./bot.js', { token: process_settings.botToken, totalShards: process_settings.shardCount, respawn: true });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn()
