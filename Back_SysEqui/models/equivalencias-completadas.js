import mongoose from "mongoose";

const EquivalenciaCompletedSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UsersProfile", required: true },
    name: { type: String, required: true },
    year: { type: Number, required: true },
    note: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("EquivalenciaCompleted", EquivalenciaCompletedSchema);
