// eslint.config.js
import js from "@eslint/js";
import eslintPluginImport from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest", // Usa la última versión de ECMAScript
      sourceType: "module", // Import/export en lugar de require
      globals: {
        process: "readonly", // Define "process" como global de solo lectura
        __dirname: "readonly", // Evita errores con __dirname
        console: "readonly", // Evita errores con console
        URL: "readonly", // Evita errores con URL
        module: "readonly",
      },
    },
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      "no-unused-vars": "warn", // Advertencia si hay variables sin usar
      "no-console": "off", // Permitir console.log()
      "import/order": "off",
    },
  },
];
