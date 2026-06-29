import equivalenciasPendientesService from "../services/equivalencias-pendientes.js";

const equivalenciasPendientesController = {
  createOne: async (req, res) => {
    try {
      await equivalenciasPendientesService.createEquivalenciaPendiente(req.body);
      res.status(201).json({ message: "Equivalencia pendiente creada" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getOne: async (req, res) => {
    try {
      const equivalencia = await equivalenciasPendientesService.getOneEquivalenciaPendiente(req.params.id);
      res.status(200).json({ message: "Equivalencia pendiente encontrada", equivalencia });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const equivalencias = await equivalenciasPendientesService.getAllEquivalenciasPendientes();
      res.status(200).json({ message: "Equivalencias pendientes encontradas", equivalencias });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  deleteOne: async (req, res) => {
    try {
      await equivalenciasPendientesService.deleteEquivalenciaPendiente(req.params.id);
      res.status(200).json({ message: "Usuario eliminado lógicamente" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
};

export default equivalenciasPendientesController;
