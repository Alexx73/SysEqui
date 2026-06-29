import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoURI);
    console.log("Conexión a MongoDB exitosa");

    // Listeners
    mongoose.connection.on("connected", () => {
      console.log("Mongoose conectado a la base de datos");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Error de conexión de Mongoose:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose desconectado de la base de datos");
    });
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
