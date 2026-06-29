const timeCalcMiddleware = (req, res, next) => {
  if (process.env.HEADER_EXECUTION_TIME === "true") {
    // Marca de tiempo inicial
    const start = Date.now();
    const originalSend = res.send;
    res.send = function (body) {
      // Calcula la duración del calculo de la respuesta
      const duration = Date.now() - start;
      // Agrega el encabezado
      res.setHeader("X-Execution-Time", `${duration} ms`);
      // Llama a la función original
      return originalSend.call(this, body);
    };
  }
  return next();
};

export default timeCalcMiddleware;
