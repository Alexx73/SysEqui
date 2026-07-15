import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

export let redis;
let isRedisOn = false;

const redisEnabled = process.env.REDIS_ENABLED !== "false";
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = Number(process.env.REDIS_PORT || 6379);

async function createRedisConnection() {
  if (!redisEnabled) {
    console.log("Redis desactivado por configuración, cache desactivada");
    return;
  }

  redis = new Redis({
    host: redisHost,
    port: redisPort,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 1000,
    maxRetriesPerRequest: 0,
    retryStrategy: null,
  });

  redis.on("close", () => {
    if (isRedisOn) {
      isRedisOn = false;
      console.log("Redis desconectado, cache desactivada");
    }
  });

  redis.on("error", () => {
    // El error inicial se informa en el catch de connect().
    // Este listener evita errores no manejados sin llenar la consola.
  });

  try {
    await redis.connect();
    isRedisOn = true;
    console.log(`Conectado a Redis en ${redisHost}:${redisPort}`);

    try {
      await redis.flushall();
      console.log("Redis cache limpiado al conectarse");
    } catch (error) {
      console.error("Error limpiando Redis:", error.message);
    }

    console.log("Redis está listo y operativo");
  } catch {
    isRedisOn = false;
    console.log("Redis no disponible, cache desactivada");
  }
}

createRedisConnection();

export async function getRedis(key) {
  if (!isRedisOn || !redis) return undefined;

  const data = await redis.get(key);
  return data ? JSON.parse(data) : undefined;
}

export async function isRedisReady() {
  return isRedisOn;
}

export async function setRedis(key, value) {
  if (isRedisOn && redis) {
    await redis.set(key, JSON.stringify(value));
  }
}

export async function setexRedis(key, value, ttl) {
  if (isRedisOn && redis) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
}
