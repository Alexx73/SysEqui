// Library
import express from "express";
// Controller
import materiasController from "../controllers/materias.js";

const router = express.Router();

// Rutas de listados de equivalencias provenientes de /materias/

router.get("/", materiasController.getAllEquivalences);
router.post("/", materiasController.createEquivalence);
router.get("/:id", materiasController.getOneEquivalence);
router.patch("/:id", materiasController.updateEquivalence);
router.delete("/:id", materiasController.deleteEquivalence);
router.patch("/:id/activate", materiasController.activateEquivalence);

export default router;
