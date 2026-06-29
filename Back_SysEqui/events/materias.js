import { eventEmitter } from "../configs/EventEmitter.js";
import { redis, isRedisReady } from "../database/redis.js";

// Escuchar el evento para almacenar los usuarios en Redis
eventEmitter.on("getAllListadosEquivalencias", async (equivalencias) => {
  try {
    const isRedisOn = await isRedisReady();
    if (isRedisOn) {
      const pipeline = redis.pipeline();
      await Promise.all(
        equivalencias.map((equivalencia) => {
          pipeline.setex(`materias/${equivalencia.id}`, 3600, JSON.stringify(equivalencia));
        }),
      );
      pipeline.setex("materias", 3600, JSON.stringify(equivalencias));
      await pipeline.exec();
    }
  } catch (error) {
    console.error("Error al almacenar todas las materias en caché:", error);
  }
});
