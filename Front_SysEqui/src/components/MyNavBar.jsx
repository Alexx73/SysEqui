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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuVersion, setProfileMenuVersion] = useState(0);
  const initials = userData.name[0] + userData.lastname[0];
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => {
    setProfileMenuVersion((version) => version + 1);
    setMobileMenuOpen((open) => !open);
  };

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
    <Navbar fluid rounded className="relative bg-gray-900 text-white md:[&>div]:flex-nowrap">
      <div className="order-3 flex shrink-0" onClick={closeMobileMenu}>
        <Dropdown
          key={profileMenuVersion}
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

      <div className="order-1 flex shrink-0 md:hidden">
        <Navbar.Toggle
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
        />
      </div>

      <Navbar.Collapse className="order-4 hidden md:static md:order-1 md:!block md:!w-auto md:flex-none md:bg-transparent md:p-0 md:shadow-none">
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

      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 order-4 w-full rounded-b-lg bg-gray-900 px-4 pb-4 shadow-xl md:hidden">
          <ul className="mt-4 flex flex-col">
            {linksToShow.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? "font-bold text-white underline" : "text-white/70 hover:text-white"
                    }`
                  }>
                  {label}
                </NavLink>
              </li>
            ))}
            <li className="mt-2 border-t border-white/20 pt-2">
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  openLogoutModal();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-white/10 hover:text-red-300">
                <HiLogin className="h-5 w-5" aria-hidden="true" />
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </Navbar>
  );
}
