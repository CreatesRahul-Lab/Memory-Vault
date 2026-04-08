import mongoose, { Document, Model } from "mongoose";

export interface IReminder extends Document {
  user: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  triggerAt: Date;
  message: string;
  fired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new mongoose.Schema<IReminder>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    triggerAt: { type: Date, required: true },
    message: { type: String, default: "" },
    fired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reminderSchema.index({ user: 1, triggerAt: 1 });
reminderSchema.index({ fired: 1, triggerAt: 1 });

const Reminder: Model<IReminder> =
  mongoose.models.Reminder || mongoose.model<IReminder>("Reminder", reminderSchema);

export default Reminder;
