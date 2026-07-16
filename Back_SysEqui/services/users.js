// Library
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
// Models
import LoginAudit from "../models/LoginAudit.js";
import UsersAuth from "../models/usersAuth.js";
import UsersProfile from "../models/usersProfile.js";
import UsersUnAuth from "../models/usersUnAuth.js";
import Cursos from "../models/cursos.js";
import EquivalenciaCompleted from "../models/equivalencias-completadas.js";
import EquivalenciaPendiente from "../models/equivalencias-pendientes.js";
// Functions
import { validatePassword } from "../functions/validatePassword.js";
// Config
import { configLoginAudit } from "../configs/configValues.js";
// Redis
import { getRedis, setRedis } from "../database/redis.js";
// Event
// import { eventEmitter } from "../configs/EventEmitter.js";
// import "../events/usersEvents.js";

const userService = {
  // Función para registrar un usuario
  registerUser: async (body) => {
    // Validar que los datos del usuario sean correctos
    const { dni, password, email, name, lastname, cellphone } = body;
    if (!dni || !password || !email || !name || !lastname) {
      throw {
        status: 400,
        message: "Todos los campos obligatorios son necesarios",
      };
    }
    // Validar que el formato del correo electrónico sea correcto
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw {
        status: 400,
        message: "El formato del correo electrónico no es válido",
      };
    }
    // Validar que la contraseña sea correcta
    let errorOnPassword = validatePassword(password);
    if (errorOnPassword !== "") {
      throw {
        status: 400,
        message: errorOnPassword,
      };
    }
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    // Crear el nuevo usuario
    const newUser = new UsersUnAuth({
      dni: dni,
      password: hashedPassword,
      email: email,
      name: name,
      lastname: lastname,
      cellphone: cellphone,
      createdAt: new Date(),
    });
    await newUser.save();
  },
  // Función para iniciar sesión en un usuario
  loginUser: async (req) => {
    // Obtener los datos del usuario de la solicitud de login y la información del dispositivo
    const { dni, password } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const parser = new UAParser();
    const userAgent = req.headers["user-agent"];
    const deviceInfo = parser.setUA(userAgent).getResult();
    const failedAttempts = await LoginAudit.find({
      ip,
      status: "FAILED",
      timestamp: {
        $gt: new Date(Date.now() - configLoginAudit.TIME_WINDOW),
      },
    });
    // Validar que los datos del usuario sean correctos y que no haya intentos fallidos
    if (failedAttempts.length >= configLoginAudit.MAX_ATTEMPTS) {
      await LoginAudit.create({
        dni,
        status: "BLOCKED",
        ip,
        reason: "Demasiados intentos fallidos",
        device: deviceInfo,
      });
      throw {
        status: 429,
        message: "Demasiados intentos fallidos. Intente más tarde.",
      };
    }
    // Validar que vengan los datos del usuario
    if (!dni || !password) {
      throw {
        status: 400,
        message: "DNI y contraseña son obligatorios",
      };
    }
    // Buscar el usuario en la base de datos
    const userAuth = await UsersAuth.findOne({ dni });
    // Si el usuario no existe, está eliminado o no está activo, lanzar una excepción
    if (!userAuth) {
      await LoginAudit.create({
        dni,
        status: "FAILED",
        ip,
        reason: "Usuario no encontrado o cuenta inactiva",
        device: deviceInfo,
      });
      throw {
        status: 401,
        message: "Credenciales inválidas o cuenta inactiva",
      };
    }
    // Validar que la contraseña sea correcta
    if (userAuth.passwordResetRequired) {
      const resetExpired = !userAuth.passwordResetExpiresAt || userAuth.passwordResetExpiresAt <= new Date();
      throw resetExpired
        ? {
            status: 403,
            code: "PASSWORD_RESET_EXPIRED",
            message: "La solicitud de restablecimiento venció. Contacte al administrador para renovarla.",
          }
        : {
            status: 428,
            code: "PASSWORD_RESET_REQUIRED",
            message: "Debe establecer una contraseña nueva para continuar.",
          };
    }
    const isMatch = await bcrypt.compare(password, userAuth.password);
    // Si la contraseña no es correcta, lanzar una excepción
    if (!isMatch) {
      await LoginAudit.create({
        userId: userAuth._id,
        dni,
        status: "FAILED",
        ip,
        reason: "Contraseña incorrecta",
        device: deviceInfo,
      });
      throw {
        status: 401,
        message: "Credenciales inválidas o cuenta inactiva",
      };
    }
    // Buscar el usuario por dni y obtener su perfil
    const user = await UsersProfile.findOne({ dni });
    if (user.isActive === false) {
      throw {
        status: 401,
        message: "Cuenta desactivada",
      };
    }
    // Crear un token con los datos del usuario
    const token = jwt.sign(
      {
        dni: user.dni,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        cellphone: user.cellphone,
        role: userAuth.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    // Devolvemos el token y los datos del usuario
    const userData = {
      dni: user.dni,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.cellphone,
      role: userAuth.role,
    };
    return { token, userData };
  },
  // Función para obtener datos de un usuario
  getUser: async (dni) => {
    let user = await getRedis(`users/profile/${dni}`);
    if (user) {
      return user;
    }
    // Validar que el usuario exista y no esté eliminado
    user = await UsersProfile.findOne({ dni });
    // Si el usuario no existe, está eliminado, lanzar una excepción
    if (!user) {
      throw { status: 404, message: "Usuario no encontrado" };
    }
    let userProfile = await UsersProfile.findOne({ dni }).lean();
    await setRedis(`users/profile/${dni}`, userProfile);
    if (user.role !== "admin" && user.role !== "professor") {
      const [completadas, pendientes] = await Promise.all([
        EquivalenciaCompleted.find({ userId: user._id }).select("name year").lean(),
        EquivalenciaPendiente.find({ userId: user._id }).select("name year").lean(),
      ]);
      userProfile.materiasCompletadas = completadas;
      userProfile.materiasPendientes = pendientes;
    }
    // Devolvemos el usuario
    return userProfile;
  },
  // Función para eliminar un usuario
  deleteUser: async (dni) => {
    // Validar que el usuario exista y no esté eliminado y que la cuenta esté activa
    const user = await UsersAuth.findOneAndUpdate({ dni }, { isDeleted: true }, { activeAccount: true });
    // Si el usuario no existe, está eliminado o no está activo, lanzar una excepción
    if (!user) {
      throw { status: 404, message: "Usuario no encontrado o ya eliminado" };
    }
    // Realizamos la baja lógica de un usuario
    user.isDeleted = true;
    await user.save();
  },
  // Función para obtener todos los usuarios
  getAllUsers: async () => {
    let users = await getRedis("users");
    if (users) {
      return users;
    }
    users = await UsersProfile.find({});
    // Si el usuario no existe, está eliminado o no está activo, lanzar una excepción
    if (users.length === 0) {
      throw { status: 404, message: "No hay usuarios en la base de datos" };
    }
    // eventEmitter.emit("getAllUsers", users);
    return users;
  },
  // Función para obtener el perfil del usuario autenticado
  getOwnProfile: async (userDni) => {
    // Buscamos el usuario por dni
    const userProfile = await UsersProfile.findOne({
      dni: userDni,
    });
    if (!userProfile) {
      throw { status: 404, message: "Usuario no encontrado" };
    }
    const userData = {
      dni: userProfile.dni,
      name: userProfile.name,
      lastname: userProfile.lastname,
      email: userProfile.email,
      phone: userProfile.cellphone,
      role: userProfile.role,
    };
    return userData;
  },
  // Función para actualizar el perfil del usuario autenticado
  updateOwnProfile: async (userDni, body) => {
    // Validar que los datos del usuario sean correctos
    const { name, lastname, email, phone } = body;
    if (!(name || lastname || email || phone)) {
      throw {
        status: 400,
        message: "Debes completar al menos un campo",
      };
    }
    // Buscamos el usuario por dni
    const userProfile = await UsersProfile.findOne({
      dni: userDni,
    });
    if (!userProfile) {
      throw { status: 404, message: "Usuario no encontrado" };
    }
    // Construir objeto de actualización dinámicamente
    const updateFields = {};
    if (name) updateFields.name = name;
    if (lastname) updateFields.lastname = lastname;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    // Actualizar el perfil del usuario solo con los campos presentes
    await UsersProfile.updateOne({ dni: userDni }, { $set: updateFields });
  },
  updateOwnPassword: async (userDni, body) => {
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw {
        status: 400,
        message: "Todos los campos son obligatorios",
      };
    }

    if (newPassword !== confirmPassword) {
      throw {
        status: 400,
        message: "Las contraseñas no coinciden",
      };
    }

    const userAuth = await UsersAuth.findOne({ dni: userDni });
    if (!userAuth) {
      throw { status: 404, message: "Usuario no encontrado" };
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userAuth.password);
    if (!isCurrentPasswordValid) {
      throw {
        status: 401,
        message: "La contraseña actual es incorrecta",
      };
    }

    const isSamePassword = await bcrypt.compare(newPassword, userAuth.password);
    if (isSamePassword) {
      throw {
        status: 400,
        message: "La nueva contraseña no puede ser igual a la actual",
      };
    }

    const errorOnPassword = validatePassword(newPassword);
    if (errorOnPassword !== "") {
      throw {
        status: 400,
        message: errorOnPassword,
      };
    }

    userAuth.password = await bcrypt.hash(newPassword, 10);
    await userAuth.save();
  },
  // Función para validar un usuario
  requestPasswordReset: async (adminRole, adminDni, targetDni) => {
    if (adminRole !== "admin") {
      throw { status: 403, message: "Solo un administrador puede restablecer contraseñas" };
    }
    const dni = Number(targetDni);
    if (!Number.isInteger(dni) || dni <= 0) throw { status: 400, message: "DNI inválido" };

    const profile = await UsersProfile.findOne({ dni });
    if (!profile) throw { status: 404, message: "Usuario no encontrado" };
    if (!profile.isActive) throw { status: 400, message: "No se puede restablecer una cuenta inactiva" };
    if (!["student", "professor", "preceptor"].includes(profile.role)) {
      throw { status: 403, message: "No se puede restablecer la contraseña de un administrador" };
    }

    const requestedAt = new Date();
    const expiresAt = new Date(requestedAt.getTime() + 24 * 60 * 60 * 1000);
    const userAuth = await UsersAuth.findOneAndUpdate(
      { dni, role: { $in: ["student", "professor", "preceptor"] } },
      {
        $set: {
          passwordResetRequired: true,
          passwordResetRequestedAt: requestedAt,
          passwordResetExpiresAt: expiresAt,
          passwordResetRequestedBy: adminDni,
        },
      },
      { new: true },
    );
    if (!userAuth) throw { status: 404, message: "Cuenta de acceso no encontrada" };
    return expiresAt;
  },
  completePasswordReset: async (body) => {
    const { dni, newPassword, confirmPassword } = body;
    const numericDni = Number(dni);
    if (!Number.isInteger(numericDni) || numericDni <= 0 || !newPassword || !confirmPassword) {
      throw { status: 400, message: "DNI, contraseña nueva y confirmación son obligatorios" };
    }
    if (newPassword !== confirmPassword) throw { status: 400, message: "Las contraseñas no coinciden" };
    const passwordError = validatePassword(newPassword);
    if (passwordError !== "") throw { status: 400, message: passwordError };

    const password = await bcrypt.hash(newPassword, 10);
    const updated = await UsersAuth.findOneAndUpdate(
      {
        dni: numericDni,
        passwordResetRequired: true,
        passwordResetExpiresAt: { $gt: new Date() },
        role: { $in: ["student", "professor", "preceptor"] },
      },
      {
        $set: { password },
        $unset: {
          passwordResetRequired: "",
          passwordResetRequestedAt: "",
          passwordResetExpiresAt: "",
          passwordResetRequestedBy: "",
        },
      },
      { new: true },
    );
    if (updated) return;

    const account = await UsersAuth.findOne({ dni: numericDni }).select("passwordResetRequired passwordResetExpiresAt");
    if (!account) throw { status: 404, message: "Usuario no encontrado" };
    if (!account.passwordResetRequired) {
      throw { status: 409, message: "No existe una solicitud de restablecimiento vigente" };
    }
    throw { status: 410, message: "La solicitud venció. Contacte al administrador para renovarla" };
  },
  validateUser: async (accountId) => {
    // Validar que el id corresponda a un usuario inactivo
    const unUser = await UsersUnAuth.findOne({
      _id: accountId,
    });
    if (!unUser) {
      throw {
        status: 404,
        message: "id no corresponde a un usuario inactivo",
      };
    }
    const newUserAuth = new UsersAuth({
      dni: unUser.dni,
      password: unUser.password,
    });
    const newUserProfile = new UsersProfile({
      dni: unUser.dni,
      email: unUser.email,
      name: unUser.name,
      lastname: unUser.lastname,
      cellphone: unUser.cellphone,
    });
    try {
      // Intentar guardar ambos usuarios de manera concurrente
      await Promise.all([newUserAuth.save(), newUserProfile.save()]);
    } catch (error) {
      // Si alguno de los save falla
      console.error("Error al guardar los usuarios:", error);
      throw { status: 500, message: "Error al guardar los nuevos usuarios." };
    }
    try {
      // Si ambos saves fueron exitosos, intentar eliminar el usuario inactivo
      await UsersUnAuth.deleteOne({ _id: accountId });
    } catch (error) {
      // Si el delete falla
      console.error("Error al eliminar el usuario inactivo:", error);
      throw { status: 500, message: "Error al eliminar el usuario inactivo." };
    }
  },
  // Función para validar un usuario
  getAllUnAuthUsers: async () => {
    let usersListUnAuth = await getRedis("usersUnauth");
    if (usersListUnAuth) {
      return usersListUnAuth;
    }
    usersListUnAuth = await UsersUnAuth.find();
    // Si el usuario no existe, está eliminado o no está activo, lanzar una excepción
    if (!usersListUnAuth) {
      throw {
        status: 404,
        message: "No hay usuarios inactivos en la base de datos",
      };
    }
    // eventEmitter.emit("getAllUnAuthUsers", usersListUnAuth);
    return usersListUnAuth;
  },
  // Función para eliminar un usuario inactivo
  deleteUnauthUser: async (dni) => {
    await UsersUnAuth.deleteOne({ dni });
  },
  // Función para crear un staff
  createStaff: async (userRole, body) => {
    if (userRole !== "admin") {
      throw {
        status: 401,
        message: "No está autorizado a crear un miembro del staff",
      };
    }
    // Validar que los datos del usuario sean correctos
    const { dni, password, email, name, lastname, cellphone, role } = body;
    if (!dni || !password || !email || !name || !lastname) {
      throw {
        status: 400,
        message: "Todos los campos obligatorios son necesarios",
      };
    }
    if (role !== "admin" && role !== "professor" && role !== "preceptor") {
      throw {
        status: 400,
        message: "El rol del staff no es correcto",
      };
    }
    // Validar que el formato del correo electrónico sea correcto
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw {
        status: 400,
        message: "El formato del correo electrónico no es válido",
      };
    }
    // Validar que la contraseña sea correcta
    let errorOnPassword = validatePassword(password);
    if (errorOnPassword !== "") {
      throw {
        status: 400,
        message: errorOnPassword,
      };
    }
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserAuth = new UsersAuth({
      dni: dni,
      password: hashedPassword,
      role: role,
    });
    const newUserProfile = new UsersProfile({
      dni: dni,
      email: email,
      name: name,
      lastname: lastname,
      cellphone: cellphone,
      role: role,
    });
    try {
      // Intentar guardar ambos usuarios de manera concurrente
      await Promise.all([newUserAuth.save(), newUserProfile.save()]);
    } catch (error) {
      // Si alguno de los save falla
      console.error("Error al guardar los usuarios:", error);
      throw { status: 500, message: "Error al guardar los nuevos usuarios." };
    }
  },
  getAllStaff: async () => {
    const staff = await UsersProfile.find({ role: { $in: ["admin", "professor", "preceptor"] } });
    // Si el usuario no existe, está eliminado o no está activo, lanzar una excepción
    if (!staff) {
      throw { status: 404, message: "No hay staff en la base de datos" };
    }
    return staff;
  },
  getAllStaffByRole: async (role) => {
    if (role !== "admin" && role !== "professor" && role !== "preceptor") {
      throw {
        status: 400,
        message: "El rol del staff no es correcto",
      };
    }
    const staff = await UsersProfile.find({ role });
    // Si el usuario no existe, está eliminado o no está activo, lanzar una excepción
    if (!staff) {
      throw { status: 404, message: "No hay staff en la base de datos" };
    }
    return staff;
  },
  updateProfile: async (id, body) => {
    const userProfile = await UsersProfile.findOne({dni: id});
    if (!userProfile) {
      throw { status: 404, message: "Usuario no encontrado" };
    }
    if (userProfile.dni !== body.dni) {
      const existentDniUser = await UsersAuth.findOne({ dni: body.dni });
      if (existentDniUser) {
        throw { status: 400, message: "Ya existe un usuario con este dni" };
      }
      const userAuth = await UsersAuth.findOne({ dni: userProfile.dni });
      if (!userAuth) {
        throw { status: 404, message: "Usuario no encontrado" };
      }
      userProfile.dni = body.dni;
      userAuth.dni = body.dni;
      await userAuth.save();
    }
    userProfile.name = body.name;
    userProfile.lastname = body.lastname;
    userProfile.email = body.email;
    userProfile.cellphone = body.cellphone;
    userProfile.role = body.role;
    await userProfile.save();
  },
  activeUser: async (id) => {
    const userProfile = await UsersProfile.findById(id);
    if (!userProfile) {
      throw { status: 404, message: "Usuario no encontrado" };
    }
    userProfile.isActive = true;
    await userProfile.save();
  },
  deactiveUser: async (id) => {
    const userProfile = await UsersProfile.findById(id);
    if (!userProfile) {
      throw { status: 404, message: "Usuario no encontrado" };
    }

    if (userProfile.role === "professor" || userProfile.role === "preceptor") {
      const assignedCourse = await Cursos.findOne({ docentesEncargados: userProfile._id });
      if (assignedCourse) {
        const roleName = userProfile.role === "preceptor" ? "preceptor" : "profesor";
        throw {
          status: 400,
          message: `El ${roleName} no se puede deshabilitar porque está asignado a un curso`,
        };
      }
    }

    userProfile.isActive = false;
    await userProfile.save();
  },
};

export default userService;
