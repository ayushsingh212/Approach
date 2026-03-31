import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;                   
  category: string;                
  website?: string;
  description?: string;
  location?: string;
  addedBy: mongoose.Types.ObjectId; 
  isActive: boolean;               
  tags: string[];                
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: [
        "Technology",
        "Finance",
        "Healthcare",
        "Education",
        "Marketing",
        "E-Commerce",
        "Logistics",
        "Media",
        "Real Estate",
        "Manufacturing",
        "Consulting",
        "Other",
      ],
    },

    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Please enter a valid URL (must start with http/https)"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },

    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "addedBy (admin user) is required"],
    },

    isActive: {
      type: Boolean,
      default: true, // false = soft-deleted, hidden from users
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

CompanySchema.index({ email: 1 });
CompanySchema.index({ category: 1 });
CompanySchema.index({ isActive: 1 });
CompanySchema.index({ createdAt: -1 });

// Full-text search index on name, category, tags, location
CompanySchema.index(
  { name: "text", category: "text", tags: "text", location: "text" },
  { name: "company_text_index" }
);

// ─── Query Helpers ────────────────────────────────────────────────────────────

// Always filter out inactive companies in user-facing queries
// Usage: Company.find().active()  ← call .active() to apply this
CompanySchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// ─── Clean JSON output ────────────────────────────────────────────────────────

CompanySchema.set("toJSON", {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.__v;
    return ret;
  },
});

// ─── Export ───────────────────────────────────────────────────────────────────

const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);

export default Company;