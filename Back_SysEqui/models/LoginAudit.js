import mongoose from "mongoose";

const LoginAuditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UsersProfile" },
  dni: { type: Number },
  status: { type: String, enum: ["SUCCESS", "FAILED", "BLOCKED"], required: true },
  ip: { type: String, required: true },
  reason: { type: String, required: true },
  device: { type: Object },
  timestamp: { type: Date, default: Date.now, expires: "90d" },
  role: { type: String, default: "student" },
});

export default mongoose.model("LoginAudit", LoginAuditSchema);
