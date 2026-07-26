import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsersAPI } from "../api/UsersAPI.js";
import { useUser } from "../context/UserContext.jsx";

function decodeCredentials(fragment) {
  const encoded = fragment.replace(/^#/, "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (encoded.length % 4)) % 4);
  const json = new TextDecoder().decode(
    Uint8Array.from(atob(encoded + padding), (character) => character.charCodeAt(0)),
  );
  const credentials = JSON.parse(json);

  if (!credentials?.dni || !credentials?.password) {
    throw new Error("El código QR no contiene credenciales válidas.");
  }

  return {
    dni: String(credentials.dni),
    password: String(credentials.password),
  };
}

export default function AccesoPresentacionPage() {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const authenticate = async () => {
      try {
        const credentials = decodeCredentials(window.location.hash);
        window.history.replaceState(null, "", window.location.pathname);

        const response = await UsersAPI.login(credentials);
        if (response?.status !== 200) {
          throw new Error(response?.data?.error || "No se pudo iniciar sesión.");
        }

        if (!["student", "professor"].includes(response.data.userData?.role)) {
          await UsersAPI.logout();
          throw new Error("El QR no corresponde a una cuenta habilitada para la presentación.");
        }

        updateUser(response.data.userData);
        navigate("/inicio", { replace: true });
      } catch (authenticationError) {
        window.history.replaceState(null, "", window.location.pathname);
        setError(authenticationError?.message || "No se pudo utilizar el código QR.");
      }
    };

    authenticate();
  }, [navigate, updateUser]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-6 text-center shadow dark:border-gray-700 dark:bg-gray-800">
        {!error ? (
          <>
            <h1 className="mb-3 text-2xl font-bold">Ingresando a SysEqui</h1>
            <p className="text-gray-600 dark:text-gray-300">Validando el acceso de la presentación…</p>
          </>
        ) : (
          <>
            <h1 className="mb-3 text-2xl font-bold">No se pudo ingresar</h1>
            <p className="mb-5 text-red-600 dark:text-red-400">{error}</p>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
              onClick={() => navigate("/login", { replace: true })}>
              Ir al inicio de sesión
            </button>
          </>
        )}
      </section>
    </main>
  );
}
