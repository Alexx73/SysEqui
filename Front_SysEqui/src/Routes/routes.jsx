// Library
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
// Components
import { MyNavBar } from "../components/MyNavBar.jsx";
// Functions
import ProtectedRoutes, { CommonRoute } from "../utils/ProtectedRoutes.jsx";
// Pages
import Login from "../screens/LoginPage";
import RegistroPage from "../screens/RegistroPage.jsx";
import Inicio from "../screens/InicioPage.jsx";
import ValidarAlumnos from "../screens/ValidarAlumnosPage.jsx";
import AsignarEquivalencia from "../screens/AsignarEquivalencia.jsx";
import ListaAlumnos from "../screens/ListaAlumnosPage.jsx";
import MateriasAprobadas from "../screens/MateriasAprobadasPage.jsx";
import Unauthorized from "../screens/UnauthorizedPage.jsx";
import RestablecerPasswordPage from "../screens/RestablecerPasswordPage.jsx";
// Contexts
import { useUser } from "../context/UserContext"; // Importar el contexto
// API
import { UsersAPI } from "../api/UsersAPI.js";

// Admin
import AdminDashboard from "../screens/admin/AdminDashboard.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import CrearCursoForm from "../screens/forms/CrearCursoForm.jsx";
// import PreceptoresScreen from "../screens/ProfesoresScreen.jsx";
import Docente from "../screens/DocentePage.jsx";
import ListaDeMaterias from "../screens/ListaDeMateriasPage.jsx";

import AdministrarCursos from "../screens/AdministrarCursos.jsx";
import Profesores from "../screens/ProfesoresPage.jsx";

// Layouts

const Routing = () => {
  const { userData, clearUser } = useUser(); // Usar el contexto
  const { openLogoutModal } = useUser();

  return (
    <Router>
      {userData && <MyNavBar onLogout={openLogoutModal} />}
      <Routes>
        {/* Rutas públicas */}
        <Route element={<CommonRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/restablecer-password" element={<RestablecerPasswordPage />} />
        </Route>
        {/* Acceso compartido: student + admin */}
        <Route element={<ProtectedRoutes allowRoles={["student", "preceptor", "professor", "admin"]} />}>
          <Route path="/inicio" element={<Inicio />} />
        </Route>

        {/* Solo para student */}
        <Route element={<ProtectedRoutes allowRoles={["student"]} />}>
          <Route path="/materiasaprobadas" element={<MateriasAprobadas />} />
        </Route>

{/* Solo para preceptor */}
        <Route element={<ProtectedRoutes allowRoles={["preceptor"]} />}>
          {/* <Route path="/listaAlumnos" element={<ListaAlumnosScreen />} /> */}
        </Route>

        {/* Solo para docente */}
        <Route element={<ProtectedRoutes allowRoles={["professor", "admin"]} />}>
          <Route path="/docente" element={<Docente />} />
        </Route>

        {/* Solo para admin */}
        <Route element={<ProtectedRoutes allowRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard onLogout={openLogoutModal} />} />
            <Route path="/validarAlumnos" element={<ValidarAlumnos />} />
            <Route path="/asignarEquivalencias" element={<AsignarEquivalencia />} />
<Route path="/listaAlumnos" element={<ListaAlumnos />} />
            <Route path="/crearcursoform" element={<CrearCursoForm />} />
            <Route path="/profesores" element={<Profesores />} />
            <Route path="/administrarcursos" element={<AdministrarCursos />} />
            <Route path="/listaMaterias" element={<ListaDeMaterias />} />
          </Route>
        </Route>
        {/* Default fallback */}
        <Route path="*" element={<Navigate to={userData ? "/inicio" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default Routing;
