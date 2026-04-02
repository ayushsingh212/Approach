import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Sub-document: Per-company delivery result ────────────────────────────────

export interface IDeliveryResult {
  company: mongoose.Types.ObjectId;
  companyEmail: string; // snapshot at time of send (email might change later)
  companyName: string; // snapshot
  status: "sent" | "failed";
  errorMessage?: string; // populated only if status === "failed"
  messageId?: string; // Nodemailer messageId on success
}

// ─── TypeScript Interface ────────────────────────────────────────────────────

export interface IAttachmentUrl {
  filename: string;
  url: string;
}

export interface IEmailLog extends Document {
  _id: mongoose.Types.ObjectId;
  sentBy: mongoose.Types.ObjectId; // ref: User
  senderEmail: string; // snapshot of user.senderEmail at send time
  subject: string;
  body: string; // HTML body
  companies: mongoose.Types.ObjectId[]; // all companies targeted
  deliveryResults: IDeliveryResult[]; // per-company status
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  attachmentUrls: IAttachmentUrl[];
  status: "completed" | "partial" | "all_failed";
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schema: Delivery Result ─────────────────────────────────────────────

const DeliveryResultSchema = new Schema<IDeliveryResult>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    companyEmail: {
      type: String,
      required: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
    },

    errorMessage: {
      type: String,
      default: null,
    },

    messageId: {
      type: String,
      default: null,
    },
  },
  { _id: false }, // No separate _id for sub-documents
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const EmailLogSchema = new Schema<IEmailLog>(
  {
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "sentBy (user) is required"],
    },

    senderEmail: {
      type: String,
      required: [true, "Sender email snapshot is required"],
    },

    subject: {
      type: String,
      required: [true, "Email subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },

    body: {
      type: String,
      required: [true, "Email body is required"],
    },

    companies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Company",
      },
    ],

    deliveryResults: {
      type: [DeliveryResultSchema],
      default: [],
    },

    totalTargeted: {
      type: Number,
      required: true,
      min: 1,
    },

    totalSent: {
      type: Number,
      default: 0,
      min: 0,
    },

    attachmentUrls: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

    totalFailed: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ KEY FIX: status is required, but now gets set BEFORE create()
    status: {
      type: String,
      enum: {
        values: ["completed", "partial", "all_failed"],
        message:
          'status must be one of: "completed", "partial", or "all_failed"',
      },
      required: [true, "Status is required"],
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

EmailLogSchema.index({ sentBy: 1, sentAt: -1 }); // user's email history (most recent first)
EmailLogSchema.index({ sentAt: -1 }); // admin: all logs recent first
EmailLogSchema.index({ status: 1 }); // filter by status

// ─── Pre-save: Auto-compute totals and status (optional, as backup) ───────────
// This runs AFTER creation if the document reaches save() without these fields.
// But now the route.ts sets them explicitly before create(), so this is a safety net.

EmailLogSchema.pre("save", async function () {
  if (this.deliveryResults && this.deliveryResults.length > 0) {
    // Only recompute if not already set (allow route to override)
    if (this.totalSent === 0 && this.totalFailed === 0) {
      this.totalSent = this.deliveryResults.filter(
        (r) => r.status === "sent",
      ).length;
      this.totalFailed = this.deliveryResults.filter(
        (r) => r.status === "failed",
      ).length;
    }

    // Recompute status based on current totals
    if (this.totalFailed === 0) {
      this.status = "completed";
    } else if (this.totalSent === 0) {
      this.status = "all_failed";
    } else {
      this.status = "partial";
    }
  }
});

// ─── Clean JSON output ────────────────────────────────────────────────────────

EmailLogSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.__v;
    return ret;
  },
});

// ─── Export ───────────────────────────────────────────────────────────────────

const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog ||
  mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
