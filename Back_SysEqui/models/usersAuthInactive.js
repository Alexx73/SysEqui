import mongoose from "mongoose";

const UsersAuthInactiveSchema = new mongoose.Schema(
  {
    dni: { type: Number, required: true, unique: true, positive: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export default mongoose.model("UsersAuthInactive", UsersAuthInactiveSchema);
