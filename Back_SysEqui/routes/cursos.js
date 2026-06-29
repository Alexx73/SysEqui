// Library
import express from "express";
// Controller
import cursosController from "../controllers/cursos.js";

const router = express.Router();

// Rutas de listados de equivalencias provenientes de /materias/

router.get("/", cursosController.getAllCursos);
router.post("/", cursosController.createCursos);
router.patch("/assignNote/:id", cursosController.assignNote);
router.get("/searchByProfessor/:id", cursosController.searchByProfessor);
router.get("/:id", cursosController.getOneCursos);
router.patch("/:id", cursosController.updateCursos);
router.delete("/:id", cursosController.deleteCursos);

export default router;
