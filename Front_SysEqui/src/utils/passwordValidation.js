export const passwordRulesText =
  "Reglas: 8 a 20 caracteres, una mayúscula, una minúscula, un número y un símbolo especial.";

export const validatePasswordRules = (password = "") => {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (password.length > 20) return "La contraseña no puede tener más de 20 caracteres";
  if (!/[A-Z]/.test(password)) return "La contraseña debe tener al menos una mayúscula";
  if (!/[a-z]/.test(password)) return "La contraseña debe tener al menos una minúscula";
  if (!/[0-9]/.test(password)) return "La contraseña debe tener al menos un número";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "La contraseña debe tener al menos un símbolo especial";
  return "";
};
