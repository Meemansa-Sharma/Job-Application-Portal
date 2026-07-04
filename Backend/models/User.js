import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
    role: {
      type: String,
      enum: ["seeker", "employer", "admin"],
      default: "seeker",
    },

    // ── Employer-only fields ──
    company: { type: String, default: "" }, // only meaningful when role === "employer"
    industry: { type: String, default: "" },
    companySize: { type: String, default: "" },
    founded: { type: String, default: "" },
    headquarters: { type: String, default: "" },
    companyDescription: { type: String, default: "" },

    // ── Seeker-only profile fields ──
    location: { type: String, default: "" },
    about: { type: String, default: "" },
    skills: { type: [String], default: [] },
    education: {
      degree: { type: String, default: "" },
      institute: { type: String, default: "" },
      gradYear: { type: String, default: "" },
      cgpa: { type: String, default: "" },
    },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    resume: { type: String, default: "" }, // path to most-recently uploaded resume (seeker convenience copy)
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

// Rough profile-completion percentage used by the "Complete your profile" banner.
// Counts a handful of meaningful fields; not stored, computed on demand.
userSchema.methods.getProfileCompletion = function () {
  if (this.role !== "seeker") return 100;
  const checks = [
    !!this.resume,
    this.skills && this.skills.length > 0,
    !!this.about,
    !!this.location,
    !!this.education?.degree,
    !!this.linkedin || !!this.github,
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const User = mongoose.model("User", userSchema);
export default User;
