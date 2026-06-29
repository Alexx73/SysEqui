import { eventEmitter } from "../configs/EventEmitter.js";
import { redis, isRedisReady, setexRedis } from "../database/redis.js";

// Escuchar el evento para almacenar los usuarios en Redis
eventEmitter.on("getAllUsers", async (users) => {
  try {
    const isRedisOn = await isRedisReady();
    if (isRedisOn) {
      const pipeline = redis.pipeline();
      await Promise.all(
        users.map((user) => {
          pipeline.setex(`users/profile/${user.dni}`, 3600, JSON.stringify(user));
        }),
      );
      pipeline.setex("users", 3600, JSON.stringify(users));
      await pipeline.exec();
    }
  } catch (error) {
    console.error("Error al almacenar todos los usuarios en caché:", error);
  }
});

eventEmitter.on("getAllUnAuthUsers", async (users) => {
  try {
    setexRedis("usersUnauth", users, 3600);
  } catch (error) {
    console.error("Error al almacenar todos los usuarios en caché:", error);
  }
});
