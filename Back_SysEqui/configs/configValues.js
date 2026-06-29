export const configLoginAudit = {
  MAX_ATTEMPTS: 5,
  TIME_WINDOW: 600000,
};

export const requiredEnvVars = [
  "MONGO_URI",
  "PORT",
  "NODE_ENV",
  "HEADER_EXECUTION_TIME",
  "ATOMIC_BDD",
  "JWT_SECRET",
  "ENDPOINT_LOGS",
  "REDIS_PORT",
  "REDIS_HOST",
  "FRONTEND_URL",
];
