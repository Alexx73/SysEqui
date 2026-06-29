// // Library
// import { Outlet, Navigate, useNavigate, replace } from "react-router-dom";
// // Context
// import { useUser } from "../context/UserContext";
// import { useEffect } from "react";

// const ProtectedRoutes = ({ allowRoles }) => {
//   const navigate = useNavigate();
//   const { userData } = useUser();
//   useEffect(() => {
//     if (!userData) {
//       navigate("/login", { replace: true });
//     }
//   }, [userData, navigate]);
//   return userData && allowRoles.includes(userData.role) ? <Outlet /> : <Navigate to="/home" replace />;
// };

// export const CommonRoute = () => {
//   const { userData } = useUser();
//   return !userData ? <Outlet /> : <Navigate to="/login" replace />;
// };
// export default ProtectedRoutes;

// utils/ProtectedRoutes.jsx
// utils/ProtectedRoutes.jsx
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoutes = ({ allowRoles }) => {
  const { userData } = useUser();

  if (!userData) {
    // No está logueado
    return <Navigate to="/login" replace />;
  }

  if (!allowRoles.includes(userData.role)) {
    // Logueado pero sin permiso
    return <Navigate to="/unauthorized" replace />;
  }

  // Tiene permisos
  return <Outlet />;
};

export const CommonRoute = () => {
  const { userData } = useUser();
  return !userData ? <Outlet /> : <Navigate to="/inicio" replace />;
};

export default ProtectedRoutes;
