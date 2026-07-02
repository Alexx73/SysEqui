// Library
import { useEffect, useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useRef } from "react"; // Importante

// API
import { UsersAPI } from "../api/UsersAPI";
// Schema
import loginSchema from "../schemas/loginSchema";
// Context
import { useUser } from "../context/UserContext";
// Flowbite
import { Button, Checkbox, Label, TextInput } from "flowbite-react";

import { HiMiniEyeSlash } from "react-icons/hi2";
import { HiMiniEye } from "react-icons/hi2";

export default function Login() {
  const alreadyNavigated = useRef(false);

  const navigate = useNavigate();
  const { userData, updateUser } = useUser();
  const initialFormValues = {
    dni: "",
    password: "",
    remember: false,
  };
  const hardcodedFormValues = {
    dni: "22222222",
    // password: "strongPassword123!",
    remember: false,
  };
  const [formValues, setFormValues] = useState(hardcodedFormValues);
  const [errors, setErorrs] = useState({});
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { dni, password } = formValues;
      console.log(formValues);
      const body = { dni: Number(dni), password };
      loginSchema.parse(body);
      const response = await UsersAPI.login(body);

      if (response?.status === 200) {
        const user = response.data.userData;
        updateUser(user); // Actualiza el contexto manualmente

        // ✅ Redirigir inmediatamente según el rol
        switch (user.role) {
          case "admin":
            navigate("/inicio");
            break;
          case "professor":
            navigate("/docente");
            break;
          case "preceptor":
            navigate("/listaAlumnos");
            break;
          case "student":
            navigate("/materiasaprobadas", { state: { alumno: user } });
            break;
          default:
            console.warn("Rol desconocido:", user.role);
        }
      } else {
        console.log("error", response.data);
        alert("❌ Login fallido:", response.data);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErorrs(fieldErrors);
      } else {
        alert("❌ Error inesperado:", error);
      }
    }
  };

  return (
    <div className="container mx-auto pt-2">
      <h2 className="font-bold text-lg text-center">Sistema de Equivalencias - Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4 mx-auto py-12">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="dni" value="Ingrese DNI" />
          </div>
          <TextInput
            id="dni"
            type="number"
            placeholder="22222222"
            value={formValues.dni}
            onChange={handleChange}
            color={errors.dni ? "failure" : undefined}
            helperText={errors.dni && <span>{errors.dni}</span>}
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password" value="Ingrese su clave" />
          </div>
          <TextInput
            id="password"
            type={mostrarPassword ? "text" : "password"}
            placeholder="strongP@ssw0rd"
            value={formValues.password}
            onChange={handleChange}
            color={errors.password ? "failure" : undefined}
            helperText={errors.password && <span>{errors.password}</span>}
            required
            addon={
              <span
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="cursor-pointer text-blue-500 select-none text-xl">
                {mostrarPassword ? <HiMiniEyeSlash /> : <HiMiniEye />}
              </span>
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={formValues.remember} onChange={handleChange} />
          <Label htmlFor="remember">Recordarme</Label>
        </div>
        <Button type="submit">Ingresar</Button>
        <p>
          ¿No tenés cuenta aún?{" "}
          <a
            className="text-blue-500 cursor-pointer"
            onClick={() => {
              navigate("/registro");
            }}>
            Registrarse aquí
          </a>
        </p>
      </form>
    </div>
  );
}

