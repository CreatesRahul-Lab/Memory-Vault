import mongoose, { Document, Model } from "mongoose";

export interface IWebhook extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  lastTriggered: Date | null;
  failCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const webhookSchema = new mongoose.Schema<IWebhook>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    events: [{ type: String, enum: ["item.created", "item.updated", "item.deleted", "collection.updated"] }],
    secret: { type: String, required: true },
    active: { type: Boolean, default: true },
    lastTriggered: { type: Date, default: null },
    failCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

webhookSchema.index({ user: 1 });
webhookSchema.index({ active: 1, events: 1 });

const Webhook: Model<IWebhook> =
  mongoose.models.Webhook || mongoose.model<IWebhook>("Webhook", webhookSchema);

export default Webhook;
