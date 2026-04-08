import mongoose, { Document, Model } from "mongoose";

export interface IClipRule extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  pattern: string;
  matchType: "domain" | "url_contains" | "title_contains";
  autoTags: string[];
  autoCollection: mongoose.Types.ObjectId | null;
  captureFullPage: boolean;
  active: boolean;
  hitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const clipRuleSchema = new mongoose.Schema<IClipRule>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    pattern: { type: String, required: true },
    matchType: { type: String, enum: ["domain", "url_contains", "title_contains"], default: "domain" },
    autoTags: [{ type: String, lowercase: true, trim: true }],
    autoCollection: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", default: null },
    captureFullPage: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    hitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

clipRuleSchema.index({ user: 1, active: 1 });

const ClipRule: Model<IClipRule> =
  mongoose.models.ClipRule || mongoose.model<IClipRule>("ClipRule", clipRuleSchema);

export default ClipRule;
