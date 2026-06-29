import equivalenciasCompletadasService from "../services/equivalencias-completadas.js";

const equivalenciasCompletadasController = {
  getAllEquivalencias: async (req, res) => {
    try {
      const equivalencias = await equivalenciasCompletadasService.getAllEquivalencias();
      res.status(200).json(equivalencias);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getOneEquivalencia: async (req, res) => {
    try {
      const equivalencia = await equivalenciasCompletadasService.getOneEquivalencia(req.params.id);
      res.status(200).json(equivalencia);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  createEquivalencia: async (req, res) => {
    try {
      const equivalencia = await equivalenciasCompletadasService.createEquivalencia(req.user.role, req.body);
      res.status(201).json(equivalencia);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  updateEquivalencia: async (req, res) => {
    try {
      const equivalencia = await equivalenciasCompletadasService.updateEquivalencia(
        req.user.role,
        req.params.id,
        req.body,
      );
      res.status(200).json(equivalencia);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  deleteEquivalencia: async (req, res) => {
    try {
      const equivalencia = await equivalenciasCompletadasService.deleteEquivalencia(req.user.role, req.params.id);
      res.status(200).json({ equivalencia, message: "Equivalencia eliminada" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
};

export default equivalenciasCompletadasController;
