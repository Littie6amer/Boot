import { ShardingManager } from "discord.js";
import { config } from "dotenv"; config()
import mongoose from "mongoose";

// mongoose.connect(process.env.DB_URL as string)

const manager = new ShardingManager("./build/bot.js", {
    respawn: true,
    token: process.env.BOT_TOKEN
})

manager.on("shardCreate", (shard) => console.log(`>> Spawning shard ${shard.id}!`))

manager.spawn()