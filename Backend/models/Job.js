import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, default: "" },
    company: { type: String, required: true }, // copied from employer.company at creation time
    location: { type: String, required: true },
    tags: { type: [String], default: [] }, // e.g. ["React", "Tailwind", "JavaScript"]
    salary: { type: String, default: "Not disclosed" }, // kept as a string ("₹8 LPA") to match your UI
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
      default: "Full-time",
    },
    experience: { type: String, default: "Not specified" }, // e.g. "Fresher", "1-3 yrs"
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

// lets the frontend search bar do a text search across title/company/location
jobSchema.index({ title: "text", company: "text", location: "text", tags: "text" });

const Job = mongoose.model("Job", jobSchema);
export default Job;
