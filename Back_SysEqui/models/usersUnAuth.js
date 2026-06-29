import mongoose from "mongoose";

const UsersUnAuthSchema = new mongoose.Schema(
  {
    dni: { type: Number, required: true, min: 1 },
    password: { type: String, required: true },
    createdAt: { type: Date, required: true },
    role: { type: String, default: "student" },
    email: { type: String, required: true },
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    cellphone: { type: String },
  },
  { versionKey: false },
);

export default mongoose.model("UsersUnAuth", UsersUnAuthSchema);
