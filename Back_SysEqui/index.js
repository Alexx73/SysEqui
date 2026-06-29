// Library
import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./configs/swagger.js";
// Routes
import routes from "./routes/barrelRoutes.js";
// Middleware
import cors from "cors";
import cookieParser from "cookie-parser";
import middlewares from "./middlewares/barrelMiddleware.js";
// Cron
import cronJobs from "./jobs/cronConfig.js";
// Configs
import { validateEnvVars } from "./functions/validateEnvVars.js";

// Cargar las variables de entorno
dotenv.config();
validateEnvVars();

// Definir el puerto del servidor
const app = express();

// Definimos e importamos variables de entorno
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = `localhost:${PORT}`;

// Deshabilitar la cabecera de "X-Powered-By"
app.disable("x-powered-by");
// Deshabilitar la cabecera de "ETag"
app.disable("etag");

// Conectar a MongoDB
connectDB();

// Configurar los cron jobs
cronJobs();

// Configurar CORS
app.use(
  cors({
    origin: [
      // para http
      `http://${FRONTEND_URL}`,
      // para https
      `https://${FRONTEND_URL}`,
    ],
    credentials: true,
  }),
);

// Configurar el parser de cookies
app.use(cookieParser());

// Middleware para manejar JSON
app.use(express.json());

// Middleware para manejar autenticación
app.use(middlewares.docsMiddleware);

// Ruta para la documentación de Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      withCredentials: true,
    },
  }),
);

// Middleware para manejar logs de las peticiones
app.use(middlewares.endpointLogs);

// Middleware para medir tiempo de ejecución
app.use(middlewares.timeCalcMiddleware);

// Middleware para manejar autenticación
app.use(middlewares.authMiddleware);

// Usar las rutas de equivalencias
app.use("/pendientes", routes.pendientesRoutes);
app.use("/completadas", routes.completadasRoutes);

// Usar las rutas de usuarios
app.use("/users", routes.usersRoutes);

// Usar las rutas de materias
app.use("/materias", routes.materiasRoutes);

// Usar las rutas de cursos
app.use("/cursos", routes.cursosRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Backend SysEqui funcionando");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${BACKEND_URL}`);
  console.log(`Swagger disponible en http://${BACKEND_URL}/api-docs`);
});
