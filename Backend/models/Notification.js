import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // who this notification is FOR
    },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["application_update", "new_applicant", "interview_scheduled", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
    relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
    relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: "Application", default: null },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
