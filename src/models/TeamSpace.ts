import mongoose, { Document, Model } from "mongoose";

export interface ITeamSpace extends Document {
  name: string;
  description: string;
  color: string;
  owner: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: "admin" | "editor" | "viewer";
    joinedAt: Date;
  }[];
  collections: mongoose.Types.ObjectId[];
  isPublic: boolean;
  inviteCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const teamSpaceSchema = new mongoose.Schema<ITeamSpace>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    color: { type: String, default: "#e8b931" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
    isPublic: { type: Boolean, default: false },
    inviteCode: { type: String, default: null },
  },
  { timestamps: true }
);

teamSpaceSchema.index({ owner: 1 });
teamSpaceSchema.index({ "members.user": 1 });
teamSpaceSchema.index({ inviteCode: 1 });

const TeamSpace: Model<ITeamSpace> =
  mongoose.models.TeamSpace || mongoose.model<ITeamSpace>("TeamSpace", teamSpaceSchema);

export default TeamSpace;
