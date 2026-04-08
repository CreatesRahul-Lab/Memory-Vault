import mongoose, { Document, Model } from "mongoose";

export interface ICollection extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description: string;
  color: string;
  icon: string;
  isPublic: boolean;
  shareToken: string | null;
  collaborators: {
    user: mongoose.Types.ObjectId;
    role: "viewer" | "editor" | "admin";
  }[];
  savedFilter: {
    search?: string;
    tags?: string[];
    types?: string[];
    favorite?: boolean;
  } | null;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new mongoose.Schema<ICollection>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    color: { type: String, default: "#e8b931" },
    icon: { type: String, default: "folder" },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, default: null, sparse: true },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["viewer", "editor", "admin"], default: "viewer" },
      },
    ],
    savedFilter: {
      type: {
        search: String,
        tags: [String],
        types: [String],
        favorite: Boolean,
      },
      default: null,
    },
    itemCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

collectionSchema.index({ user: 1, createdAt: -1 });
collectionSchema.index({ shareToken: 1 });
collectionSchema.index({ "collaborators.user": 1 });

const Collection: Model<ICollection> =
  mongoose.models.Collection || mongoose.model<ICollection>("Collection", collectionSchema);

export default Collection;
