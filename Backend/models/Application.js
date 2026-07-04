import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: { type: String, required: true }, // path to the resume file used for THIS application
    coverLetter: { type: String, default: "" },
    // NOTE: this vocabulary matches my-applications.html / employer-dashboard.html on the frontend.
    // applied -> review -> interview -> selected, with rejected possible at any point.
    status: {
      type: String,
      enum: ["applied", "review", "interview", "selected", "rejected"],
      default: "applied",
    },
    interviewDate: { type: Date, default: null },
    interviewTime: { type: String, default: "" },
    interviewMode: { type: String, default: "" }, // e.g. "Google Meet", "In-person"
    interviewLink: { type: String, default: "" },
    interviewNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

// a seeker should not be able to apply to the same job twice
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
