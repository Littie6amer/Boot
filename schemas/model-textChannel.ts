import { Schema, model, Document } from "mongoose";
import { $d, $r } from "./utils";


type ExtendedChannelType = "CHAT" | "INFO" | "NEWS" | "VOTING" | "SPOTLIGHT" | "SPAM"

interface Panel {
  id: string,
  type: "ROLE" | "MEMBER",
  length: number
}

interface SlowModeRoleOrMember {
  id: string,
  type: "ROLE" | "MEMBER",
  length: number
}

export interface TextChannelDocument extends Document {
  id: string;
  type: ExtendedChannelType,
  panels: Panel[]
  // slowmode: SlowModeRoleOrMember[]
}

const schema = new Schema({
  id: $r(String),
  type: $d(String, "SPAM"),
  panels: $d(Object, []),
  // slowmode: $d(Object, [])
});

export const TextChannelModel = model<TextChannelDocument>("textChannels", schema);