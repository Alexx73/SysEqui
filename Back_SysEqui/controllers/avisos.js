import avisosService from "../services/avisos.js";

const respondError = (res, error) => res.status(error.status || 500).json({ error: error.message });

const avisosController = {
  getAvisos: async (req, res) => {
    try {
      res.status(200).json({ avisos: await avisosService.getAvisos(req.user.role) });
    } catch (error) { respondError(res, error); }
  },
  createAviso: async (req, res) => {
    try {
      const aviso = await avisosService.createAviso(req.body, req.user);
      res.status(201).json({ aviso, message: "Aviso creado" });
    } catch (error) { respondError(res, error); }
  },
  updateAviso: async (req, res) => {
    try {
      const aviso = await avisosService.updateAviso(req.params.id, req.body, req.user.role);
      res.status(200).json({ aviso, message: "Aviso actualizado" });
    } catch (error) { respondError(res, error); }
  },
  deleteAviso: async (req, res) => {
    try {
      await avisosService.deleteAviso(req.params.id, req.user.role);
      res.status(200).json({ message: "Aviso eliminado" });
    } catch (error) { respondError(res, error); }
  },
};

export default avisosController;
