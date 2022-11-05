import { Schema, model, Document } from "mongoose";
import { $d, $r } from "./utils";

export interface GuildDocument extends Document {
  id: string;
  levelingSettings: {
    enabled: boolean
  },
  channelSettings: {
    categoryFormat: string,
    textChannelFormat: string,
    voiceChannelFormat: string,
  }
}

const schema = new Schema({
  id: $r(String),
  levelingSettings: {
    enabled: $d(Boolean, false)
  },
  channelSettings: {
    categoryFormat: $d(String, "{name}"),
    textChannelFormat: $d(String, "{name}"),
    voiceChannelFormat: $d(String, "{name}")
  }
});

export const GuildModel = model<GuildDocument>("guilds", schema);