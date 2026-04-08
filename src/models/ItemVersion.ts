import mongoose, { Document, Model } from "mongoose";

export interface IItemVersion extends Document {
  item: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  snapshot: Record<string, unknown>;
  changeNote: string;
  version: number;
  createdAt: Date;
}

const itemVersionSchema = new mongoose.Schema<IItemVersion>(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    changeNote: { type: String, default: "" },
    version: { type: Number, required: true },
  },
  { timestamps: true }
);

itemVersionSchema.index({ item: 1, version: -1 });

const ItemVersion: Model<IItemVersion> =
  mongoose.models.ItemVersion || mongoose.model<IItemVersion>("ItemVersion", itemVersionSchema);

export default ItemVersion;
