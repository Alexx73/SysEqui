import { requiredEnvVars } from "../configs/configValues.js";

export const validateEnvVars = () => {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    console.error("¡Error! Falta(n) la(s) siguiente(s) variable(s) de entorno:");
    missingVars.forEach((key) => console.error(`  - ${key}`));
    console.error("Por favor, asegúrate de definirlas en el archivo .env.");
    process.exit(1);
  }
};
