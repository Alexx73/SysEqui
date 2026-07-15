import dotenv from "dotenv";
import mongoose from "mongoose";
import Avisos from "../models/avisos.js";

dotenv.config();
const titulo = "Aviso de prueba";

try {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en Back_SysEqui/.env");
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Avisos.updateOne(
    { titulo },
    { $setOnInsert: { titulo, contenido: "Este es un aviso de prueba creado desde el nuevo sistema de avisos.", activo: true } },
    { upsert: true },
  );
  console.log(result.upsertedCount ? "Aviso de prueba creado." : "El aviso de prueba ya existía; no se duplicó.");
} catch (error) {
  console.error("No se pudo crear el aviso de prueba:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
