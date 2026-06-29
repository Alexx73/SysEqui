import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const CursosSchema = new mongoose.Schema(
  {
    idMateria: { type: ObjectId, required: true, ref: "Materias" },
    docentesEncargados: [{ type: ObjectId, ref: "UsersProfile" }],
    shift: { type: String, default: "diurno" },
    alumnos: [
      {
        idAlumno: { type: ObjectId, ref: "UsersProfile" },
        nota: { type: Number },
      },
    ],
    fechaInicio: { type: Date },
    fechaEstimadaFin: { type: Date },
  },
  { timestamps: false },
);

export default mongoose.model("Cursos", CursosSchema);
