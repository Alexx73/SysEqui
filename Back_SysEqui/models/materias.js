import mongoose from "mongoose";

const MateriasSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    year: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: false },
);

export default mongoose.model("Materias", MateriasSchema);
