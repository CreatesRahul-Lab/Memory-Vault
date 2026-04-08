import mongoose, { Model } from "mongoose";

export interface IItem {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  url: string;
  title: string;
  description: string;
  domain: string;
  favicon: string;
  type: "page" | "video" | "tweet" | "pdf" | "note" | "screenshot" | "transcript";
  tags: string[];
  aiTags: string[];
  notes: string;
  content: string;
  summary: string;
  keyPoints: string[];
  collection: mongoose.Types.ObjectId | null;
  duplicateOf: mongoose.Types.ObjectId | null;
  highlights: { text: string; color: string; note: string }[];
  reviewCount: number;
  nextReviewDate: Date | null;
  easeFactor: number;
  interval: number;
  isTask: boolean;
  taskDone: boolean;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new mongoose.Schema<IItem>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    title: { type: String, default: "Untitled" },
    description: { type: String, default: "" },
    domain: { type: String, default: "" },
    favicon: { type: String, default: "" },
    type: {
      type: String,
      enum: ["page", "video", "tweet", "pdf", "note", "screenshot", "transcript"],
      default: "page",
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    aiTags: [{ type: String, lowercase: true, trim: true }],
    notes: { type: String, default: "" },
    content: { type: String, default: "" },
    summary: { type: String, default: "" },
    keyPoints: [{ type: String }],
    collection: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", default: null },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
    highlights: [
      {
        text: { type: String, required: true },
        color: { type: String, default: "#e8b931" },
        note: { type: String, default: "" },
      },
    ],
    reviewCount: { type: Number, default: 0 },
    nextReviewDate: { type: Date, default: null },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
    isTask: { type: Boolean, default: false },
    taskDone: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

itemSchema.index({ user: 1, createdAt: -1 });
itemSchema.index({ user: 1, tags: 1 });
itemSchema.index({ user: 1, aiTags: 1 });
itemSchema.index({ user: 1, collection: 1 });
itemSchema.index({ user: 1, nextReviewDate: 1 });
itemSchema.index({ user: 1, isTask: 1, taskDone: 1 });
itemSchema.index({ url: 1, user: 1 });
itemSchema.index({ title: "text", description: "text", notes: "text", content: "text", summary: "text" });

const Item: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>("Item", itemSchema);

export default Item;
