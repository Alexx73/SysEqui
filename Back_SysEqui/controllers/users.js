import userService from "../services/users.js";

const userController = {
  registerUser: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para registrar el usuario
      await userService.registerUser(req.body);
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(201).json({ message: "Usuario registrado" });
    } catch (error) {
      // Escalamos el status del servicio si lo hay y enviamos el mensaje de error
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  loginUser: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para iniciar sesión
      const { token, userData } = await userService.loginUser(req);
      // Crear una cookie con el token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 3600000,
      });
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(200).json({ message: "Sesión iniciada", userData });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getUser: async (req, res) => {
    try {
      // Obtenemos el DNI del usuario de la ruta
      const user = await userService.getUser(req.params.dni);
      // Devolvemos el usuario encontrado
      res.status(200).json({ message: "Usuario encontrado", user });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para eliminar el usuario
      await userService.deleteUser(req.params.dni);
      // Devolvemos el mensaje de usuario eliminado
      res.status(200).json({ message: "Usuario eliminado lógicamente" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para obtener todos los usuarios
      const users = await userService.getAllUsers();
      // Devolvemos los usuarios encontrados
      res.status(200).json({ message: "Usuarios encontrados", users });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getOwnProfile: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para obtener el perfil del usuario autenticado
      const userData = await userService.getOwnProfile(req.user.dni);
      // Devolvemos el perfil del usuario
      res.status(200).json({ userData });
    } catch (error) {
      console.log(error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  logoutUser: async (req, res) => {
    try {
      // Borramos la cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(200).json({ message: "Sesión finalizada" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  updateOwnProfile: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para actualizar el perfil del usuario autenticado
      await userService.updateOwnProfile(req.user.dni, req.body);
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(200).json({ message: "Perfil actualizado" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  validateUser: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para validar un usuario
      await userService.validateUser(req.body.accountId);
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(201).json({ message: "Usuario validado" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getAllUnAuthUsers: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para obtener todos los usuarios inactivos
      const users = await userService.getAllUnAuthUsers();
      // Devolvemos los usuarios encontrados
      res.status(200).json({ users });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  deleteUnauthUser: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para eliminar el usuario
      await userService.deleteUnauthUser(req.params.dni);
      // Devolvemos el mensaje de usuario eliminado
      res.status(200).json({ message: "Usuario eliminado" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  createStaff: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para crear un staff
      await userService.createStaff(req.user.role, req.body);
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(201).json({ message: "Usuario creado" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getAllStaff: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para obtener todos los staff
      const staff = await userService.getAllStaff();
      // Devolvemos los staff encontrados
      res.status(200).json({ message: "Staff encontrados", staff });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  getAllStaffByRole: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para obtener todos los staff
      const staff = await userService.getAllStaffByRole(req.params.role);
      // Devolvemos los staff encontrados
      res.status(200).json({ message: "Staff encontrados", staff });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  updateProfile: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para actualizar el perfil del usuario autenticado
      await userService.updateProfile(req.params.id, req.body);
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(200).json({ message: "Perfil actualizado" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  activeUser: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para activar un usuario
      await userService.activeUser(req.params.id);
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(200).json({ message: "Usuario activado" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
  deactiveUser: async (req, res) => {
    try {
      // Llamamos al servicio de usuarios para desactivar un usuario
      await userService.deactiveUser(req.params.id);
      // Devolvemos el mensaje de usuario registrado y el usuario creado
      res.status(200).json({ message: "Usuario desactivado" });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  },
};

export default userController;
