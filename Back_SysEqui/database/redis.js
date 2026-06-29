import Redis from "ioredis";

export let redis;
let isRedisOn = false;
let contRedisMessajeError = 0;

async function createRedisConnection() {
  redis = new Redis({
    host: "localhost",
    port: 6379,
    retryStrategy: () => {
      return 2000;
    },
  });

  redis.on("connect", () => {
    console.log("Conectado a Redis en localhost");
  });

  redis.on("ready", async () => {
  try {
    await redis.flushall();
    console.log("Redis cache limpiado al conectarse");
  } catch (e) {
    console.error("Error limpiando Redis:", e);
  }

    console.log("Redis está listo y operativo");
    isRedisOn = true;
    contRedisMessajeError = 0;
  });

  redis.on("error", () => {
    //no hace nada, pero tiene que estar para no llenar la consola de errores.
  });

  redis.on("close", () => {
    if (contRedisMessajeError === 0) {
      console.log("Redis se cerró por error");
      contRedisMessajeError++;
    }
    if (isRedisOn) {
      isRedisOn = false;
    }
  });
}

async function main() {
  await createRedisConnection();
}

main();

export async function getRedis(key) {
  if (isRedisOn) {
    const data = JSON.parse(await redis.get(key));
    if (data) {
      return data;
    }
  }
}

export async function isRedisReady() {
  return isRedisOn;
}

export async function setRedis(key, value) {
  if (isRedisOn) {
    await redis.set(key, JSON.stringify(value));
  }
}

export async function setexRedis(key, value, ttl) {
  if (isRedisOn) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
}
