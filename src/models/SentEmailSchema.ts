import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ISentEmail extends Document {
  _id: mongoose.Types.ObjectId;
  sentBy: mongoose.Types.ObjectId;   // ref: User
  company: mongoose.Types.ObjectId;  // ref: Company
  sentAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SentEmailSchema = new Schema<ISentEmail>(
  {
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

// ─── Compound unique index (equivalent to @@unique([userId, companyId])) ──────
// Ensures one record per user-company pair; upsert is safe to call repeatedly.

SentEmailSchema.index({ sentBy: 1, company: 1 }, { unique: true });

// ─── Export ───────────────────────────────────────────────────────────────────

const SentEmail: Model<ISentEmail> =
  mongoose.models.SentEmail ||
  mongoose.model<ISentEmail>("SentEmail", SentEmailSchema);

export default SentEmail;
