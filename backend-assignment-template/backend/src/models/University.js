import mongoose from "mongoose";

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
    },
    partnerType: {
      type: String,
      enum: ["direct", "recruitment-partner", "institution-partner"],
      default: "direct",
    },
    qsRanking: Number,
    scholarshipAvailable: {
      type: Boolean,
      default: false,
    },
    popularScore: {
      type: Number,
      default: 0,
      index: true,
    },
    tags: [String],
    websiteUrl: String,

    // 🔥 ADD THIS
    programs: [
      {
        name: String,
        field: String,
        intake: String,
        tuitionFee: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

universitySchema.index({ name: "text", country: "text", city: "text" });

export default mongoose.model("University", universitySchema);