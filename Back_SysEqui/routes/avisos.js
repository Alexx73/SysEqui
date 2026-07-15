import express from "express";
import avisosController from "../controllers/avisos.js";

const router = express.Router();
router.get("/", avisosController.getAvisos);
router.post("/", avisosController.createAviso);
router.patch("/:id", avisosController.updateAviso);
router.delete("/:id", avisosController.deleteAviso);

export default router;
