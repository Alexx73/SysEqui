import consoleColor from "../configs/consoleColors.js";

const logRequest = (req, res, next) => {
  // Verificar si la variable de entorno LOG_REQUESTS está activada
  if (process.env.ENDPOINT_LOGS === "true") {
    // Obtener verbo y ruta, y la hora de ejecución
    const { method, originalUrl } = req;
    const start = Date.now();
    // Evento para cuando se haya completado la respuesta
    res.on("finish", () => {
      // Calcular la duración
      const duration = Date.now() - start;
      // Obtener el código de estado
      const status = res.statusCode;

      // Crear la salida con los colores
      const dateStr = `${consoleColor.blue}${new Date().toISOString()}`;
      const methodStr = `${consoleColor.green}${method}`;
      const urlStr = `${consoleColor.cyan}${originalUrl}`;
      const statusStr = `${consoleColor.yellow}${status}`;
      const durationStr = `${consoleColor.magenta}${duration}ms${consoleColor.reset}`;

      // Imprimir la información con colores
      console.log(`[${dateStr}] ${methodStr} ${urlStr} ${statusStr} - ${durationStr}`);
    });
  }
  next();
};

export default logRequest;
