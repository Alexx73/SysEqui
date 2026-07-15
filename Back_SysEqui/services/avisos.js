import mongoose from "mongoose";
import Avisos from "../models/avisos.js";

const ALLOWED_FIELDS = ["titulo", "contenido", "activo"];

const assertAdmin = (role) => {
  if (role !== "admin") throw { status: 403, message: "Solo un administrador puede gestionar avisos" };
};

const validateBody = (body, partial = false) => {
  const unknown = Object.keys(body).filter((field) => !ALLOWED_FIELDS.includes(field));
  if (unknown.length) throw { status: 400, message: `Campos no permitidos: ${unknown.join(", ")}` };
  if (partial && Object.keys(body).length === 0) throw { status: 400, message: "No se enviaron cambios" };

  for (const field of ["titulo", "contenido"]) {
    if (!partial || Object.hasOwn(body, field)) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        throw { status: 400, message: `${field} es obligatorio` };
      }
    }
  }
  if (body.titulo?.trim().length > 120) throw { status: 400, message: "El título no puede superar 120 caracteres" };
  if (body.contenido?.trim().length > 2000) throw { status: 400, message: "El contenido no puede superar 2000 caracteres" };
  if (Object.hasOwn(body, "activo") && typeof body.activo !== "boolean") {
    throw { status: 400, message: "activo debe ser verdadero o falso" };
  }
};

const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw { status: 400, message: "ID de aviso inválido" };
};

const avisosService = {
  getAvisos: (role) => Avisos.find(role === "admin" ? {} : { activo: true }).sort({ createdAt: -1 }),
  createAviso: async (body, user) => {
    assertAdmin(user.role);
    validateBody(body);
    return Avisos.create({
      titulo: body.titulo.trim(),
      contenido: body.contenido.trim(),
      activo: body.activo ?? true,
      createdBy: user.dni,
      autor: [user.name, user.lastname].filter(Boolean).join(" ") || "Administrador",
    });
  },
  updateAviso: async (id, body, role) => {
    assertAdmin(role);
    validateId(id);
    validateBody(body, true);
    const changes = { ...body };
    if (changes.titulo) changes.titulo = changes.titulo.trim();
    if (changes.contenido) changes.contenido = changes.contenido.trim();
    const aviso = await Avisos.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
    if (!aviso) throw { status: 404, message: "Aviso no encontrado" };
    return aviso;
  },
  deleteAviso: async (id, role) => {
    assertAdmin(role);
    validateId(id);
    const aviso = await Avisos.findByIdAndDelete(id);
    if (!aviso) throw { status: 404, message: "Aviso no encontrado" };
  },
};

export default avisosService;
