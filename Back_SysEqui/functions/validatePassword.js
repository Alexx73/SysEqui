export const validatePassword = (password) => {
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (password.length > 20) {
    return "La contraseña no puede tener más de 20 caracteres.";
  }
  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe tener al menos una mayúscula.";
  }
  if (!/[a-z]/.test(password)) {
    return "La contraseña debe tener al menos una minúscula.";
  }
  if (!/[0-9]/.test(password)) {
    return "La contraseña debe tener al menos un número.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "La contraseña debe tener al menos un carácter especial.";
  }
  return "";
};
