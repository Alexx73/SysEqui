import mongoose from "mongoose";

const UsersAuthDeletedSchema = new mongoose.Schema(
  {
    dni: { type: Number, required: true, unique: true, positive: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
  },
  { versionKey: false },
);

export default mongoose.model("UsersAuthDeleted", UsersAuthDeletedSchema);
