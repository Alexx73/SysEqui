import EquivalenciaCompleted from "../models/equivalencias-completadas.js";

const STAFF_ROLES = ["admin", "professor", "preceptor"];

const equivalenciasCompletadasService = {
  getAllEquivalencias: async () => {
    return await EquivalenciaCompleted.find();
  },
  getOneEquivalencia: async (id) => {
    const equivalencia = await EquivalenciaCompleted.findById(id);
    if (!equivalencia) {
      throw { status: 404, message: "No se encontró la equivalencia" };
    }
    return equivalencia;
  },
  createEquivalencia: async (role, body) => {
    if (!STAFF_ROLES.includes(role)) {
      throw { status: 403, message: "No tienes permisos para crear equivalencias completadas" };
    }
    const { userId, name, year, note } = body;
    const equivalencia = new EquivalenciaCompleted({ userId, name, year, note });
    return await equivalencia.save();
  },
  updateEquivalencia: async (role, id, body) => {
    if (!STAFF_ROLES.includes(role)) {
      throw { status: 403, message: "No tienes permisos para actualizar equivalencias completadas" };
    }
    const { name, year, note } = body;
    const equivalencia = await EquivalenciaCompleted.findByIdAndUpdate(id, { name, year, note }, { new: true });
    if (!equivalencia) {
      throw { status: 404, message: "No se encontró la equivalencia" };
    }
    return equivalencia;
  },
  deleteEquivalencia: async (role, id) => {
    if (!STAFF_ROLES.includes(role)) {
      throw { status: 403, message: "No tienes permisos para eliminar equivalencias completadas" };
    }
    const equivalencia = await EquivalenciaCompleted.findByIdAndDelete(id);
    if (!equivalencia) {
      throw { status: 404, message: "No se encontró la equivalencia" };
    }
    return equivalencia;
  },
};

export default equivalenciasCompletadasService;
