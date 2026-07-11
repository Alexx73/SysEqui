// Models
import mongoose from "mongoose";
import Cursos from "../models/cursos.js";
import Materias from "../models/materias.js";
import EquivalenciaCompleted from "../models/equivalencias-completadas.js";
import EquivalenciaPendiente from "../models/equivalencias-pendientes.js";

const cursosService = {
  // Función para crear un curso
  createCursos: async (body) => {
    const { idMateria } = body;
    if (!idMateria) {
      throw {
        status: 400,
        message: "El id de la materia es obligatorio",
      };
    }
    const fechaInicio = body.fechaInicio ? new Date(body.fechaInicio) : new Date();
    const fechaEstimadaFin = body.fechaEstimadaFin ? new Date(body.fechaEstimadaFin) : new Date();
    const docentesEncargados = body.docentesEncargados ?? [];
    const alumnos = body.alumnos ?? [];
    const shift = body.shift ?? "diurno";
    if (!Array.isArray(docentesEncargados)) {
      throw {
        status: 400,
        message: "docentesEncargados debe ser un arreglo",
      };
    }
    if (!Array.isArray(alumnos)) {
      throw {
        status: 400,
        message: "alumnos debe ser un arreglo",
      };
    }
    let materia = await Materias.findById(idMateria);
    if (!materia) {
      throw {
        status: 400,
        message: "No existe una materia con ese id",
      };
    }
    const curso = new Cursos({
      idMateria,
      docentesEncargados,
      alumnos,
      fechaInicio,
      fechaEstimadaFin,
      shift,
    });
    await curso.save();
    return curso;
  },
  // Función para actualizar un curso
  updateCurso: async (id, body) => {
    const curso = await Cursos.findById(id);
    if (!curso) {
      throw {
        status: 404,
        message: "No se encontró el curso",
      };
    }
    curso.idMateria = body.idMateria;
    curso.docentesEncargados = body.docentesEncargados;
    curso.alumnos = body.alumnos;
    curso.fechaInicio = body.fechaInicio;
    curso.fechaEstimadaFin = body.fechaEstimadaFin;
    curso.shift = body.shift;
    await curso.save();
    return curso;
  },
  // Función para obtener datos de un curso
  getOneCurso: async (id) => {
    const curso = await Cursos.findById(id);
    // Si el curso no existe, lanzar una excepción
    if (!curso) {
      throw {
        status: 404,
        message: "No se encontró el curso",
      };
    }
    return curso;
  },
  // Función para obtener todos las equivalencias
  getAllCursos: async () => {
    const cursos = await Cursos.find();
    // Si el curso no existe lanzar una excepción
    if (cursos.length === 0) {
      throw {
        status: 404,
        message: "No hay cursos en la base de datos",
      };
    }
    return cursos;
  },
  // Función para eliminar un curso
  deleteCurso: async (id) => {
    const curso = await Cursos.findById(id);
    if (!curso) {
      throw {
        status: 404,
        message: "No se encontró el curso",
      };
    }
    await curso.deleteOne();
  },
  searchByProfessor: async (id) => {
    const cursos = await Cursos.find({ docentesEncargados: id });
    if (!cursos) {
      throw {
        status: 404,
        message: "No se encontró la equivalencia",
      };
    }
    return cursos;
  },
  assignNote: async (id, body, role) => {
    if (body.idAlumno === undefined || body.idAlumno === null || body.idAlumno === "" || body.nota === undefined || body.nota === null || body.nota === "") {
      throw {
        status: 400,
        message: "Los campos idAlumno y nota son obligatorios",
      };
    }
    if (body.nota < 0 || body.nota > 10) {
      throw {
        status: 400,
        message: "La nota debe estar entre 0 y 10",
      };
    }
    if (!mongoose.Types.ObjectId.isValid(body.idAlumno)) {
      throw { status: 400, message: "El idAlumno no es un ObjectId válido" };
    }
    const curso = await Cursos.findOne({ _id: id });
    if (!curso) {
      throw {
        status: 404,
        message: "No se encontró el curso",
      };
    }
    // Buscamos el alumno dentro del array de alumnos. Se contempla _id como respaldo
    // para cursos antiguos guardados antes de normalizar el formato { idAlumno, nota }.
    const alumno = curso.alumnos.find((a) => {
      const alumnoId = a.idAlumno || a._id;
      return alumnoId?.toString() === body.idAlumno.toString();
    });
    // Si no encontramos al alumno, lanzamos un error
    if (!alumno) {
      throw {
        status: 404,
        message: "No se encontró el alumno en este curso",
      };
    }
    if (alumno.nota > 0 && role !== "admin") {
      throw {
        status: 403,
        message: "No puedes cambiar la nota de un alumno que ya tiene una nota asignada",
      };
    }
    // Actualizamos la nota
    const alumnoId = alumno.idAlumno || alumno._id;
    alumno.nota = body.nota;
    if (body.nota >= 6) {
      const materia = await Materias.findById(curso.idMateria);
      await EquivalenciaCompleted.create({
        userId: alumnoId,
        name: materia.name,
        year: materia.year,
        note: body.nota,
      });
      await EquivalenciaPendiente.deleteOne({
        userId: alumnoId,
        name: materia.name,
        year: materia.year
      });
    }
    await curso.save();
    return curso;
  },
};

export default cursosService;
