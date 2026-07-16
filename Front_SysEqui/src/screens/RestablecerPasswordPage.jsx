import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput } from "flowbite-react";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { UsersAPI } from "../api/UsersAPI";
import { passwordRulesText, validatePasswordRules } from "../utils/passwordValidation";
import { useToast } from "../components/toastContext";

export default function RestablecerPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dni = sessionStorage.getItem("passwordResetDni");
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dni) navigate("/login", { replace: true });
  }, [dni, navigate]);

  if (!dni) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const validationError = validatePasswordRules(form.newPassword);
    if (validationError) return setError(validationError);
    if (form.newPassword !== form.confirmPassword) return setError("Las contraseñas no coinciden");

    setSubmitting(true);
    const response = await UsersAPI.completePasswordReset({ dni: Number(dni), ...form });
    setSubmitting(false);
    if (response?.status === 200) {
      sessionStorage.removeItem("passwordResetDni");
      showToast({ message: "Contraseña restablecida. Ya puede iniciar sesión con su clave nueva.", type: "success" });
      navigate("/login", { replace: true });
    } else {
      setError(response?.data?.error || "No se pudo restablecer la contraseña");
    }
  };

  return (
    <div className="container mx-auto px-4 pt-8">
      <div className="mx-auto max-w-md rounded-xl border border-blue-500/30 bg-slate-800 p-6 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">Crear una contraseña nueva</h1>
        <p className="mb-6 text-center text-sm text-gray-300">El administrador solicitó que actualice su contraseña antes de ingresar.</p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="reset-dni" value="DNI" />
            <TextInput id="reset-dni" value={dni} disabled />
          </div>
          <div>
            <Label htmlFor="new-password" value="Nueva contraseña" />
            <TextInput
              id="new-password"
              type={showPasswords ? "text" : "password"}
              value={form.newPassword}
              onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
              required
              addon={<button type="button" aria-label={showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"} onClick={() => setShowPasswords((visible) => !visible)}>{showPasswords ? <HiMiniEyeSlash /> : <HiMiniEye />}</button>}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password" value="Confirmar contraseña" />
            <TextInput
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              required
            />
          </div>
          <p className="text-xs text-gray-400">{passwordRulesText}</p>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <Button type="submit" color="blue" disabled={submitting}>{submitting ? "Guardando..." : "Guardar contraseña"}</Button>
        </form>
      </div>
    </div>
  );
}
