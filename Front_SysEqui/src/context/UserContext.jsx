import { createContext, useContext, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { UsersAPI } from "../api/UsersAPI";
import Profile from "../screens/ProfilePage.jsx";
import { useToast } from "../components/toastContext";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { showToast } = useToast();
  const [userData, setUserData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const openProfileDrawer = () => setShowProfileDrawer(true);
  const closeProfileDrawer = () => setShowProfileDrawer(false);

  const handleLogout = async () => {
    try {
      const response = await UsersAPI.logout();
      if (response.status === 200) {
        clearUser();
      } else {
        showToast({ message: response?.data?.error || "Error al cerrar sesión.", type: "error" });
      }
    } catch (error) {
      showToast({ message: error?.message || "Error en la petición de logout.", type: "error" });
    }
  };

  const updateUser = (data) => {
    setUserData(data);
  };

  const clearUser = () => {
    setUserData(null);
  };

  const openLogoutModal = () => setShowLogoutModal(true);

  const handleConfirmLogout = () => {
    showToast({ message: "Cerrando sesión...", type: "info" });
    setShowLogoutModal(false);

    setTimeout(() => {
      handleLogout();
    }, 400);
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

      <ConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de que quieres cerrar la sesión actual?"
        oneButton={false}
      />

      {userData && <Profile isOpen={showProfileDrawer} onClose={closeProfileDrawer} />}
    </UserContext.Provider>
  );
};
