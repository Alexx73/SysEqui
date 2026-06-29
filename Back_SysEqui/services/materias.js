// Models
import Materias from "../models/materias.js";
// Redis
import { getRedis } from "../database/redis.js";
// Events
import { eventEmitter } from "../configs/EventEmitter.js";

const materiasService = {
  // Función para crear una equivalencia
  createEquivalence: async (body) => {
    let equivalence = await Materias.findOne({
      name: body.name,
      year: body.year,
    });
    if (equivalence) {
      throw {
        status: 400,
        message: "Ya existe una equivalencia con ese nombre",
      };
    }
    equivalence = new Materias({
      name: body.name,
      year: body.year,
    });
    await equivalence.save();
    return equivalence;
  },
  // Función para actualizar una equivalencia
  updateEquivalence: async (id, body) => {
    const equivalence = await Materias.findById(id);
    if (!equivalence) {
      throw {
        status: 404,
        message: "No se encontró la equivalencia",
      };
    }
    equivalence.name = body.name;
    equivalence.year = body.year;
    await equivalence.save();
    return equivalence;
  },
  // Función para obtener datos de una equivalencia
  getOneEquivalence: async (id) => {
    let equivalence = await getRedis("listadosEquivalencias/" + id);
    if (equivalence) {
      return equivalence;
    }
    equivalence = await Materias.findById(id);
    // Si el usuario no existe, está eliminado o no está activo, lanzar una excepción
    if (!equivalence) {
      throw {
        status: 404,
        message: "No se encontró la equivalencia",
      };
    }
    return equivalence;
  },
  // Función para obtener todos las equivalencias
  getAllEquivalences: async () => {
    let materias = await getRedis("listadosEquivalencias");
    if (materias) {
      return materias;
    }
    materias = await Materias.find();
    // Si el usuario no existe, está eliminado o no está activo, lanzar una excepción
    if (!materias) {
      throw {
        status: 404,
        message: "No hay usuarios inactivos en la base de datos",
      };
    }
    eventEmitter.emit("getAllListadosEquivalencias", materias);
    return materias;
  },
  // Función para activar una equivalencia
  activateEquivalence: async (id) => {
    const equivalence = await Materias.findById(id);
    if (!equivalence) {
      throw { status: 404, message: "No se encontró la equivalencia" };
    }
    equivalence.active = true;
    await equivalence.save();
    return equivalence;
  },
  // Función para desactivar una equivalencia
  deleteEquivalence: async (id) => {
    const equivalence = await Materias.findById(id);
    if (!equivalence) {
      throw { status: 404, message: "No se encontró la equivalencia" };
    }
    equivalence.active = false;
    await equivalence.save();
    return equivalence;
  },
};

export default materiasService;
