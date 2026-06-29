// Library
import express from "express";
// Controller
import equivalenciasPendientesController from "../controllers/equivalencias-pendientes.js";

const router = express.Router();

router.get("/", equivalenciasPendientesController.getAll);
router.post("/", equivalenciasPendientesController.createOne);

router.get("/:id", equivalenciasPendientesController.getOne);

router.delete("/:id", equivalenciasPendientesController.deleteOne);

export default router;
