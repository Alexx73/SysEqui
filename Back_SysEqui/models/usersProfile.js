import mongoose from "mongoose";

const UsersProfile = new mongoose.Schema(
  {
    dni: { type: Number, required: true, unique: true, min: 1 },
    email: { type: String, required: true },
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    cellphone: { type: String },
    role: { type: String, default: "student" },
    isActive: { type: Boolean, default: true },
  },
  { versionKey: false },
);

export default mongoose.model("UsersProfile", UsersProfile);
