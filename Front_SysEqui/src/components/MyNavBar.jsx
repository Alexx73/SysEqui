// Library
import { useState } from "react";
import { NavLink } from "react-router-dom";
// Contexts
import { useUser } from "../context/UserContext";
// Flowbite
import { Avatar, Dropdown, Navbar } from "flowbite-react";

// Icons
import { PiStudentFill } from "react-icons/pi";
import { RiAdminLine } from "react-icons/ri";
import { HiLogin } from "react-icons/hi";

export function MyNavBar() {
  const { userData, openLogoutModal, openProfileDrawer } = useUser();
  const [navbarVersion, setNavbarVersion] = useState(0);
  const initials = userData.name[0] + userData.lastname[0];
  const closeMobileMenu = () => setNavbarVersion((version) => version + 1);

  const navLinksByRole = {
    admin: [
      { to: "/inicio", label: "Inicio" },
      { to: "/listaAlumnos", label: "Lista de Alumnos" },
      { to: "/asignarEquivalencias", label: "Asignar equivalencias" },
      { to: "/validarAlumnos", label: "Validar alumnos" },
    ],
    student: [
      { to: "/inicio", label: "Inicio" },
      { to: "/materiasaprobadas", label: "Materias Aprobadas" },
    ],
    preceptor: [
      { to: "/inicio", label: "Inicio" },
      { to: "/listaAlumnos", label: "Alumnos22" },
    ],
    professor: [
      { to: "/inicio", label: "Inicio" },
      { to: "/docente", label: "Docente" },
    ],
  };
  const linksToShow = navLinksByRole[userData.role] || [];

  return (
    <Navbar
      key={navbarVersion}
      fluid
      rounded
      className="relative bg-gray-900 text-white md:[&>div]:flex-nowrap">
      <div className="order-1 flex shrink-0 md:order-3">
        <Dropdown
          arrowIcon={false}
          inline
          label={<Avatar alt="Configuración del usuario" placeholderInitials={initials} rounded />}>
          <Dropdown.Header>
            <span className="block text-sm">{userData.name}</span>
            <span className="block truncate text-sm font-medium">{userData.email}</span>
          </Dropdown.Header>
          <Dropdown.Item onClick={openProfileDrawer}>Perfil</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item className="text-red-500" icon={HiLogin} onClick={openLogoutModal}>
            Cerrar sesión
          </Dropdown.Item>
        </Dropdown>
      </div>

      <div className="order-2 flex min-w-0 flex-1 items-center justify-center gap-2 px-2 md:ml-6 md:flex-none md:justify-start md:px-0">
        <span className="shrink-0">
          {userData.role === "student" ? (
            <PiStudentFill size="1.6em" color="green" />
          ) : (
            <RiAdminLine size="1.5em" color="orange" />
          )}
        </span>
        <span className="min-w-0 truncate text-center text-xs font-medium sm:text-sm md:text-left">
          {userData.role + ": " + userData.name + " " + userData.lastname}
        </span>
      </div>

      <div className="order-3 flex shrink-0 md:hidden">
        <Navbar.Toggle />
      </div>

      <Navbar.Collapse className="absolute left-0 right-0 top-full z-50 order-4 w-full rounded-b-lg bg-gray-900 px-4 pb-4 shadow-xl md:static md:order-1 md:!w-auto md:flex-none md:bg-transparent md:p-0 md:shadow-none">
        {linksToShow.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `text-sm px-3 py-2 rounded-md font-medium ${
                isActive ? "text-white font-bold underline" : "text-white/70 hover:text-white"
              }`
            }>
            {label}
          </NavLink>
        ))}
      </Navbar.Collapse>
    </Navbar>
  );
}
