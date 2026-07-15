import mongoose from "mongoose";

const AvisoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 120 },
    contenido: { type: String, required: true, trim: true, maxlength: 2000 },
    activo: { type: Boolean, default: true },
    createdBy: { type: Number },
    autor: { type: String, trim: true, maxlength: 160, default: "Administrador" },
  },
  { timestamps: true },
);

export default mongoose.model("Avisos", AvisoSchema);
