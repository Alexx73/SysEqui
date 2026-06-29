import mongoose from "mongoose";

const EquivalenciaPendienteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UsersProfile", required: true },
    name: { type: String, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("EquivalenciaPendiente", EquivalenciaPendienteSchema);
