// Library
import express from "express";
// Controller
import userController from "../controllers/users.js";

const router = express.Router();

// Rutas de usuarios provenientes de /users/

router.get("/", userController.getAllUsers);

router.get("/profile", userController.getOwnProfile);
router.patch("/profile", userController.updateOwnProfile);
router.post("/register", userController.registerUser);
router.post("/createStaff", userController.createStaff);
router.get("/staff", userController.getAllStaff);
router.get("/staff/:role", userController.getAllStaffByRole);

router.post("/login", userController.loginUser);

router.post("/logout", userController.logoutUser);

router.get("/unauth", userController.getAllUnAuthUsers);
router.post("/unauth", userController.validateUser);
router.delete("/unauth/:dni", userController.deleteUnauthUser);
router.post("/active/:id", userController.activeUser);
router.post("/deactive/:id", userController.deactiveUser);

router.get("/:dni", userController.getUser);
router.delete("/:dni", userController.deleteUser);
router.patch("/:id", userController.updateProfile);

export default router;
