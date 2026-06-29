import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";

import UsersAuth from "../models/usersAuth.js";
import UsersProfile from "../models/usersProfile.js";

dotenv.config();

const requiredEnvVars = [
  "MONGO_URI",
  "ADMIN_DNI",
  "ADMIN_PASSWORD",
  "ADMIN_EMAIL",
  "ADMIN_NAME",
  "ADMIN_LASTNAME",
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(`Faltan variables de entorno: ${missingEnvVars.join(", ")}`);
  console.error("Agregalas en Back_SysEqui/.env antes de ejecutar npm run seed:admin");
  process.exit(1);
}

const adminDni = Number(process.env.ADMIN_DNI);

if (!Number.isInteger(adminDni) || adminDni <= 0) {
  console.error("ADMIN_DNI debe ser un número válido.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  await UsersAuth.updateOne(
    { dni: adminDni },
    {
      $set: {
        password: hashedPassword,
        role: "admin",
      },
      $setOnInsert: {
        LastLogin: new Date(),
      },
    },
    { upsert: true },
  );

  await UsersProfile.updateOne(
    { dni: adminDni },
    {
      $set: {
        email: process.env.ADMIN_EMAIL,
        name: process.env.ADMIN_NAME,
        lastname: process.env.ADMIN_LASTNAME,
        cellphone: process.env.ADMIN_CELLPHONE || "",
        role: "admin",
        isActive: true,
      },
    },
    { upsert: true },
  );

  console.log("Usuario administrador creado/actualizado correctamente.");
  console.log(`DNI: ${adminDni}`);
  console.log(`Email: ${process.env.ADMIN_EMAIL}`);
} catch (error) {
  console.error("Error al crear/actualizar el usuario administrador:");
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
