// Library
import { useEffect, useState } from "react";
import { DarkThemeToggle, Flowbite } from "flowbite-react";
// API
import { UsersAPI } from "./api/UsersAPI.js";
// Contexts
import { useUser } from "./context/UserContext"; // Importar el contexto
// Routes
import Routing from "./Routes/routes.jsx";

function App() {
  const { updateUser } = useUser(); // Usar el contexto
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    UsersAPI.getOwnProfile()
      .then((response) => {
        if (response?.status === 200) {
          updateUser(response.data.userData);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <Flowbite></Flowbite>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <Flowbite>
        {/* Contenido principal que se expande para ocupar el espacio disponible */}
        <div className="flex-grow">
          <Routing />
        </div>

        {/* Botón flotante */}
        <div className="fixed bottom-0 right-0 m-4 z-50">
          <DarkThemeToggle />
        </div>

        <div className="pb-6"></div>
      </Flowbite>
    </div>
  );
}

export default App;

