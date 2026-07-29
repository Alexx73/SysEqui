// Models
import mongoose from "mongoose";
import Cursos from "../models/cursos.js";
import Materias from "../models/materias.js";
import EquivalenciaCompleted from "../models/equivalencias-completadas.js";
import EquivalenciaPendiente from "../models/equivalencias-pendientes.js";
import UsersProfile from "../models/usersProfile.js";

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
  assignNote: async (id, body, requestUser) => {
    if (body.idAlumno === undefined || body.idAlumno === null || body.idAlumno === "" || body.nota === undefined || body.nota === null || body.nota === "") {
      throw {
        status: 400,
        message: "Los campos idAlumno y nota son obligatorios",
      };
    }
    if (!Number.isInteger(body.nota) || body.nota < 1 || body.nota > 10) {
      throw {
        status: 400,
        message: "La nota debe ser un número entero entre 1 y 10",
      };
    }
    if (!mongoose.Types.ObjectId.isValid(body.idAlumno)) {
      throw { status: 400, message: "El idAlumno no es un ObjectId válido" };
    }

    if (!requestUser || !["admin", "professor"].includes(requestUser.role)) {
      throw { status: 403, message: "No tienes permisos para asignar o modificar notas" };
    }

    const useTransaction = process.env.ATOMIC_BDD === "true";
    const session = useTransaction ? await mongoose.startSession() : null;
    if (session) session.startTransaction();

    try {
      const queryOptions = session ? { session } : {};
      const curso = await Cursos.findById(id, null, queryOptions);
      if (!curso) {
        throw { status: 404, message: "No se encontró el curso" };
      }

      if (requestUser.role === "professor") {
        const profesor = await UsersProfile.findOne(
          { dni: requestUser.dni, role: "professor", isActive: true },
          null,
          queryOptions,
        );
        const profesorAsignado =
          profesor &&
          curso.docentesEncargados.some(
            (docenteId) => docenteId.toString() === profesor._id.toString(),
          );
        if (!profesorAsignado) {
          throw { status: 403, message: "No tienes permisos para modificar notas de este curso" };
        }
      }

      // Se contempla _id como respaldo para cursos antiguos.
      const alumno = curso.alumnos.find((item) => {
        const alumnoId = item.idAlumno || item._id;
        return alumnoId?.toString() === body.idAlumno.toString();
      });
      if (!alumno) {
        throw { status: 404, message: "No se encontró el alumno en este curso" };
      }

      const materia = await Materias.findById(curso.idMateria, null, queryOptions);
      if (!materia) {
        throw { status: 404, message: "No se encontró la materia del curso" };
      }

      const alumnoId = alumno.idAlumno || alumno._id;
      const equivalenciaKey = {
        userId: alumnoId,
        name: materia.name,
        year: materia.year,
      };

      if (body.nota >= 6) {
        await EquivalenciaCompleted.findOneAndUpdate(
          equivalenciaKey,
          { $set: { note: body.nota }, $setOnInsert: equivalenciaKey },
          { ...queryOptions, new: true, upsert: true },
        );
        await EquivalenciaPendiente.deleteMany(equivalenciaKey, queryOptions);
      } else {
        await EquivalenciaCompleted.deleteMany(equivalenciaKey, queryOptions);
        await EquivalenciaPendiente.findOneAndUpdate(
          equivalenciaKey,
          { $setOnInsert: equivalenciaKey },
          { ...queryOptions, new: true, upsert: true },
        );
      }

      alumno.nota = body.nota;
      await curso.save(queryOptions);

      if (session) await session.commitTransaction();
      return curso;
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) await session.endSession();
    }
  },
};

export default cursosService;
