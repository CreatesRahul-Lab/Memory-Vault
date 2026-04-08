import mongoose, { Document, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IApiKey extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  key: string;
  lastUsed: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IApiKeyModel extends Model<IApiKey> {
  generate(userId: string, name: string): Promise<IApiKey>;
}

const apiKeySchema = new mongoose.Schema<IApiKey>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true },
    lastUsed: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

apiKeySchema.statics.generate = function (userId: string, name: string) {
  const key = `mos_${uuidv4().replace(/-/g, "")}`;
  return this.create({ user: userId, name, key });
};

const ApiKey: IApiKeyModel =
  (mongoose.models.ApiKey as IApiKeyModel) ||
  mongoose.model<IApiKey, IApiKeyModel>("ApiKey", apiKeySchema);

export default ApiKey;
