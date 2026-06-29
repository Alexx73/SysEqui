import materiasService from "../services/materias.js";

const listadosEquivalenciasController = {
  createEquivalence: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para crear la equivalencia
      await materiasService.createEquivalence(req.body);
      // Devolvemos el mensaje de equivalencia creada
      res.status(201).json({ message: "Equivalencia creada" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  updateEquivalence: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para actualizar la equivalencia
      await materiasService.updateEquivalence(req.params.id, req.body);
      // Devolvemos el mensaje de equivalencia actualizada
      res.status(200).json({ message: "Equivalencia actualizada" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getOneEquivalence: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para obtener la equivalencia
      const equivalence = await materiasService.getOneEquivalence(req.params.id);
      // Devolvemos la equivalencia
      res.status(200).json({ equivalence });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getAllEquivalences: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para obtener todas las equivalencias
      const equivalencias = await materiasService.getAllEquivalences();
      // Devolvemos las equivalencias
      res.status(200).json({ equivalencias });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  activateEquivalence: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para activar la equivalencia
      await materiasService.activateEquivalence(req.params.id);
      // Devolvemos el mensaje de equivalencia activada
      res.status(200).json({ message: "Equivalencia activada" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  deleteEquivalence: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para eliminar la equivalencia
      await materiasService.deleteEquivalence(req.params.id);
      // Devolvemos el mensaje de equivalencia eliminada
      res.status(200).json({ message: "Equivalencia eliminada" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
};

export default listadosEquivalenciasController;
