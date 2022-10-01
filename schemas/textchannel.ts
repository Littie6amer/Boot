import { Schema, model, Document } from "mongoose";

const TextChannelSchema = new Schema({
  id: String,
  type: String,
  slowmode: Object
});

interface SlowModeRoleOrMember {
  type: "ROLE" | "MEMBER",
  id: string,
  length: number
}

type ExtendedChannelType = "CHAT" | "INFO" | "NEWS" | "VOTING" | "SPOTLIGHT" | "SPAM"
export interface TextChannelDocument extends Document {
  id: string;
  type: ExtendedChannelType,
  slowmode: SlowModeRoleOrMember[]
}

export const TextChannelModel = model<TextChannelDocument>("textchannels", TextChannelSchema);