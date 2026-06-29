import mongoose from "mongoose";

const UsersAuthSchema = new mongoose.Schema(
  {
    dni: { type: Number, required: true, unique: true, min: 1 },
    password: { type: String, required: true },
    LastLogin: { type: Date, default: Date.now },
    role: { type: String, default: "student" },
  },
  { versionKey: false },
);

export default mongoose.model("UsersAuth", UsersAuthSchema);
