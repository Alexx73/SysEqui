// Library
import mongoose from "mongoose";
// Schemas
import UsersAuth from "../../models/usersAuth.js";
import UsersAuthInactive from "../../models/usersAuthInactive.js";

const moveInactiveUsers = async () => {
  // Calcular la fecha de 90 días atrás
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 90);
  const usersToMove = await UsersAuth.find({
    LastLogin: { $lt: limitDate },
  });
  if (usersToMove.length > 0) {
    // Quitamos el dato de LastLogin
    const usersToInsert = usersToMove.map(({ dni, password, role }) => ({
      dni,
      password,
      role,
    }));
    if (process.env.ATOMIC_BDD === "true") {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Mover usuarios inactivos a la colección de inactivos
        await UsersAuthInactive.insertMany(usersToInsert, { session });
        // Borrar los usuarios inactivos de la colección original
        await UsersAuth.deleteMany({ LastLogin: { $lt: limitDate } }, { session });
        // Confirmar la transacción
        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        throw {
          status: 500,
          message: "Error al mover usuarios inactivos",
        };
      }
    } else {
      // Mover usuarios inactivos a la colección de inactivos
      await UsersAuthInactive.insertMany(usersToInsert);
      // Borrar usuarios inactivos de la colección de usuarios activos
      await UsersAuth.deleteMany({ LastLogin: { $lt: limitDate } });
    }
    console.log("Se movieron ", usersToMove.length, " usuarios inactivos");
  } else {
    console.log("No hay usuarios inactivos para mover a inactivos");
  }
};

export default moveInactiveUsers;
