import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, default: "" },
    company: { type: String, required: true }, 
    location: { type: String, required: true },
    tags: { type: [String], default: [] }, 
    salary: { type: String, default: "Not disclosed" }, 
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
      default: "Full-time",
    },
    experience: { type: String, default: "Not specified" },
    deadline: { type: Date, required: true },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);


jobSchema.index({ title: "text", company: "text", location: "text", tags: "text" });

const Job = mongoose.model("Job", jobSchema);
export default Job;
