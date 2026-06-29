// Library
import { Link, NavLink, useLocation } from "react-router-dom";
// Contexts
import { useUser } from "../context/UserContext";
// Flowbite
import { Avatar, Dropdown, Navbar } from "flowbite-react";

// Icons
import { PiStudentFill } from "react-icons/pi";
import { RiAdminLine } from "react-icons/ri";
import { HiLogin, HiPencil } from "react-icons/hi";

export function MyNavBar() {
  const { userData, openLogoutModal, openProfileDrawer } = useUser();
  const location = useLocation();
  const initials = userData.name[0] + userData.lastname[0];

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
    <Navbar fluid rounded className="bg-gray-900 text-white">
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={<Avatar alt="User settings" placeholderInitials={initials} rounded />}>
          <Dropdown.Header>
            <span className="block text-sm">{userData.name}</span>
            <span className="block truncate text-sm font-medium">{userData.email}</span>
          </Dropdown.Header>
          <Dropdown.Item onClick={openProfileDrawer}>
            Perfil
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item className="text-red-500" icon={HiLogin} onClick={openLogoutModal}>
            Cerrar sesión
          </Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>

      <Navbar.Collapse>
        {linksToShow.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-sm px-3 py-2 rounded-md font-medium ${
                isActive ? "text-white font-bold underline" : "text-white/70 hover:text-white"
              }`
            }>
            {label}
          </NavLink>
        ))}
      </Navbar.Collapse>

      <div className="flex items-center gap-3 ml-6 md:ml-0">
        {userData.role === "student" ? (
          <PiStudentFill size="1.6em" color="green" />
        ) : (
          <RiAdminLine size="1.5em" color="orange" />
        )}
        <span className="text-sm font-medium">
          {userData.role + ": " + userData.name + " " + userData.lastname}
        </span>
      </div>
    </Navbar>
  );
}

