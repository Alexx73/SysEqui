// Models
import EquivalenciaPendiente from "../models/equivalencias-pendientes.js";

const equivalenciasPendientesService = {
  // Función para crear una equivalencia pendiente
  createEquivalenciaPendiente: async (body) => {
    const { name, year, userId } = body;
    if (!name || !year || !userId) {
      throw {
        status: 400,
        message: "Todos los campos son obligatorios",
      };
    }
    const equivalencia = new EquivalenciaPendiente({
      name,
      year,
      userId,
    });
    await equivalencia.save();
  },
  // Función para obtener datos de una equivalencia pendiente
  getOneEquivalenciaPendiente: async (idEquivalencia) => {
    const equivalencia = await EquivalenciaPendiente.findById(idEquivalencia);
    // Si la equivalencia no existe, lanzar una excepción
    if (!equivalencia) {
      throw {
        status: 404,
        message: "No se encontró la equivalencia",
      };
    }
    return equivalencia;
  },
  // Función para obtener todos las equivalencias pendientes
  getAllEquivalenciasPendientes: async () => {
    const equivalencias = await EquivalenciaPendiente.find();
    // Si no hay equivalencias, lanzar una excepción
    if (equivalencias.length === 0) {
      throw {
        status: 404,
        message: "No hay equivalencias pendientes en la base de datos",
      };
    }
    return equivalencias;
  },
  // Función para activar una equivalencia pendiente
  deleteEquivalenciaPendiente: async (idEquivalencia) => {
    // Validar que el id corresponda a una equivalencia pendiente
    const equivalencia = await EquivalenciaPendiente.findByIdAndDelete(idEquivalencia);
    if (!equivalencia) {
      throw {
        status: 404,
        message: "id no corresponde a una equivalencia pendiente",
      };
    }
    return equivalencia;
  },
};

export default equivalenciasPendientesService;
