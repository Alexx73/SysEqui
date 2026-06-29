import cursosService from "../services/cursos.js";

const cursosController = {
  createCursos: async (req, res) => {
    try {
      // Llamamos al servicio para crear el curso
      await cursosService.createCursos(req.body);
      // Devolvemos el mensaje de curso creado
      res.status(201).json({ message: "Curso creado" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  updateCursos: async (req, res) => {
    try {
      // Llamamos al servicio para actualizar el curso
      await cursosService.updateCurso(req.params.id, req.body);
      // Devolvemos el mensaje de curso actualizado
      res.status(200).json({ message: "Curso actualizado" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getOneCursos: async (req, res) => {
    try {
      // Llamamos al servicio para obtener el curso
      const curso = await cursosService.getOneCursos(req.params.id);
      // Devolvemos el curso
      res.status(200).json({ curso });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getAllCursos: async (req, res) => {
    try {
      // Llamamos al servicio para obtener todas las cursos
      const cursos = await cursosService.getAllCursos();
      // Devolvemos las cursos
      res.status(200).json({ cursos });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  deleteCursos: async (req, res) => {
    try {
      // Llamamos al servicio para eliminar el curso
      await cursosService.deleteCurso(req.params.id);
      // Devolvemos el mensaje de curso eliminado
      res.status(200).json({ message: "Curso eliminado" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  searchByProfessor: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para buscar las equivalencias por profesor
      const cursos = await cursosService.searchByProfessor(req.params.id);
      // Devolvemos los cursos
      res.status(200).json({ cursos });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  assignNote: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para buscar las equivalencias por profesor
      const curso = await cursosService.assignNote(req.params.id, req.body, req.user.role);
      // Devolvemos el curso actualizado
      res.status(200).json({ curso });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
};

export default cursosController;
