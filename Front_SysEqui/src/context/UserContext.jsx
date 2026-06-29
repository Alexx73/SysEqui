// Library
import { createContext, useContext, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { Toast } from "flowbite-react";
import { HiLogout } from "react-icons/hi";

import { UsersAPI } from "../api/UsersAPI";
import Profile from "../screens/ProfilePage.jsx";

// Crear el contexto
const UserContext = createContext();
// Hook personalizado para usar el contexto
export const useUser = () => useContext(UserContext);

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const openProfileDrawer = () => setShowProfileDrawer(true);
  const closeProfileDrawer = () => setShowProfileDrawer(false);

  // 🔐 Logout real (llamando al backend y luego limpiando)
  const handleLogout = async () => {
    try {
      const response = await UsersAPI.logout();
      if (response.status === 200) {
        clearUser();
      } else {
        alert("Error al cerrar sesión:", response);
      }
    } catch (error) {
      alert("Error en la petición de logout:", error);
    }
  };

  // 👤 Actualizar usuario
  const updateUser = (data) => {
    setUserData(data);
  };

  // 🔐 Limpiar usuario (logout real)
  const clearUser = () => {
    setUserData(null);
  };

  // 🔓 Abrir modal de cierre de sesión
  const openLogoutModal = () => setShowLogoutModal(true);

  // 🔐 Confirmar logout y mostrar toast
  const handleConfirmLogout = () => {
    setShowToast(true); // Mostrar el toast
    setShowLogoutModal(false); // Cerrar modal
    setTimeout(() => {
      setShowToast(false);
    }, 400);

    // Logout y cerrar modal
    setTimeout(() => {
      handleLogout(); // Llama al logout real
    }, 400); // Esto puede ser menor si querés que se cierre antes
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        updateUser,
        clearUser,
        openLogoutModal,
        handleLogout,
        openProfileDrawer,
        closeProfileDrawer,
        showProfileDrawer,
      }}>
      {children}

      {/* ✅ Modal de cierre de sesión */}
      <ConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de que quieres cerrar la sesión actual?"
        oneButton={false}
      />

      {/* ✅ Toast de cierre de sesión */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast className="p-4 gap-4 shadow-lg max-w-md">
            <div className="inline-flex items-center justify-center rounded-lg bg-red-100 p-3 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiLogout className="w-6 h-6" />
            </div>
            <div className="ml-4 text-base font-semibold text-gray-800 dark:text-white">
              🔒 Cerrando sesión...
            </div>
          </Toast>
        </div>
      )}

      {/* ✅ Drawer de perfil */}
      {userData && <Profile isOpen={showProfileDrawer} onClose={closeProfileDrawer} />}
    </UserContext.Provider>
  );
};

