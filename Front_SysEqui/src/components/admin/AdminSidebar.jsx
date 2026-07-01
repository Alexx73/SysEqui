import {
  Drawer,
  DrawerHeader,
  DrawerItems,
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  TextInput,
  Tooltip,
} from "flowbite-react";
import {
  HiChartPie,
  HiClipboard,
  HiCollection,
  HiInformationCircle,
  HiLogin,
  HiPencil,
  HiSearch,
  HiShoppingBag,
  HiUsers,
} from "react-icons/hi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { RiMenuFold2Fill } from "react-icons/ri";

import { useState, useRef, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { href: "/admin", icon: HiChartPie, label: "Resumen" },
  { href: "/listaAlumnos", icon: HiUsers, label: "Lista de Alumnos" },
  { href: "/asignarEquivalencias", icon: HiShoppingBag, label: "Asignar Equivalencias" },
  { href: "/validarAlumnos", icon: HiChartPie, label: "Validar Alumnos" },
  { href: "/crearcurso", icon: SiGoogleclassroom, label: "Crear Curso" },
  { href: "/administrarcursos", icon: SiGoogleclassroom, label: "Administrar Cursos" },
  { href: "/listaMaterias", icon: SiGoogleclassroom, label: "Lista de Materias" },
  { href: "/profesores", icon: FaChalkboardTeacher, label: "Gestión Profesores" },
];

const extraItems = [{ onClick: "logout", icon: HiPencil, label: "Cerrar Sesión" }];

export default function AdminSidebar() {
  const { openLogoutModal } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [dniInput, setDniInput] = useState("");
  const navigate = useNavigate();

  const dniInputRef = useRef(null);
  const itemRefs = useRef([]);
  const indexRef = useRef(-1);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dniInput) return;
    navigate("/asignarEquivalencias", { state: { dniAlumno: dniInput } });
    setDniInput("");
    setIsOpen(false);
  };

  const handleKeyNavigation = (e) => {
    if (!isOpen) return;

    const isOnInput = document.activeElement === dniInputRef.current;
    const items = itemRefs.current;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      indexRef.current = (indexRef.current + 1) % items.length;
      items[indexRef.current]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      indexRef.current = (indexRef.current - 1 + items.length) % items.length;
      items[indexRef.current]?.focus();
    } else if (e.key === "Enter" && !isOnInput) {
      e.preventDefault();
      items[indexRef.current]?.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        handleToggle(); // abrir/cerrar sidebar
      } else {
        handleKeyNavigation(e); // navegación solo si está abierto
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dniInputRef.current) {
      dniInputRef.current.focus();
      indexRef.current = 0;
    }
  }, [isOpen]);

  const renderSidebarItem = (item, index, isExtra = false) => {
    const refCallback = (el) => {
      if (el) itemRefs.current.push(el);
    };

    const commonProps = {
      ref: refCallback,
      tabIndex: 0,
      className: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-2",
    };

    return (
      <SidebarItem
        key={index}
        {...commonProps}
        icon={item.icon}
        href={item.href}
        onClick={item.onClick === "logout" ? openLogoutModal : undefined}>
        {item.label}
      </SidebarItem>
    );
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed left-0 z-50" style={{ top: "30%" }}>
          <Tooltip content="Abrir/Cerrar panel (F2)">
            <div
              onClick={() => setIsOpen(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white w-5 h-20 rounded-r-md flex items-center justify-center cursor-pointer transition-all">
              <RiMenuFold2Fill className="text-4xl" />
            </div>
          </Tooltip>
        </div>
      )}

      <Drawer open={isOpen} onClose={handleToggle} sx={{ width: 320 }}>
        <DrawerHeader title="MENU Admin" titleIcon={() => <></>} />
        <DrawerItems>
          <Sidebar className="[&>div]:bg-transparent [&>div]:p-0">
            <form onSubmit={handleSubmit} className="pb-3 w-full px-4">
              <TextInput
                icon={HiSearch}
                ref={(el) => {
                  dniInputRef.current = el;
                  if (el && !itemRefs.current.includes(el)) itemRefs.current.unshift(el);
                }}
                className="w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                minLength={8}
                maxLength={8}
                type="search"
                placeholder="Buscar alumno por DNI"
                required
                value={dniInput}
                onChange={(e) => setDniInput(e.target.value)}
              />
            </form>
            <SidebarItems>
              <SidebarItemGroup className="px-4">
                {menuItems.map((item, i) => renderSidebarItem(item, i))}
              </SidebarItemGroup>
              <SidebarItemGroup className="px-4">
                {extraItems.map((item, i) => renderSidebarItem(item, i + menuItems.length))}
              </SidebarItemGroup>
            </SidebarItems>
          </Sidebar>
        </DrawerItems>
      </Drawer>
    </>
  );
}
