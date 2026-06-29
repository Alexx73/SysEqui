// Library
import express from "express";
// Controller
import equivalenciasCompletadasController from "../controllers/equivalencias-completadas.js";

const router = express.Router();

router.get("/", equivalenciasCompletadasController.getAllEquivalencias);
router.post("/", equivalenciasCompletadasController.createEquivalencia);
router.get("/:id", equivalenciasCompletadasController.getOneEquivalencia);
router.put("/:id", equivalenciasCompletadasController.updateEquivalencia);
router.delete("/:id", equivalenciasCompletadasController.deleteEquivalencia);

export default router;
