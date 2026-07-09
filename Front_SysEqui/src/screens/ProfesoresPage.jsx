import { useState, useEffect, useRef } from "react";
import { Card, Button, TextInput, Label, ToggleSwitch, Toast } from "flowbite-react";
import { HiCheck } from "react-icons/hi";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import SearchForm from "./forms/SearchFom";
import Tabla from "../components/Tabla";
import { UsersAPI } from "../api/UsersAPI";
import { passwordRulesText, validatePasswordRules } from "../utils/passwordValidation";

const initialForm = {
  dni: "",
  password: "",
  email: "",
  name: "",
  lastname: "",
  cellphone: "",
  role: "professor",
};

const dniRegex = /^\d{8}$/;
const validateDni = (dni) => /^\d{8}$/.test(dni);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];
const sortStaff = (staff = []) => [...staff].sort((a, b) => a.lastname.localeCompare(b.lastname));
const requiredCreateFields = [
  { key: "dni", label: "DNI" },
  { key: "name", label: "nombre" },
  { key: "lastname", label: "apellido" },
  { key: "email", label: "email" },
  { key: "password", label: "contraseña" },
];

export default function Profesores() {
  const [form, setForm] = useState(initialForm);
  const [profesores, setProfesores] = useState([]);
  const [staffCompleto, setStaffCompleto] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState("");
  const [mostrarFormCrearUsuario, setMostrarFormCrearUsuario] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const searchRef = useRef();

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(""), 2000);
  };

  const cargarStaff = async ({ resetPage = true } = {}) => {
    try {
      const res = await UsersAPI.getAllStaff();
      const staff = sortStaff(res.data.staff || []);
      setStaffCompleto(staff);
      setProfesores(staff);
      if (resetPage) setPage(1);
    } catch (err) {
      alert("❌ Error al cargar staff", err);
    }
  };

  useEffect(() => {
    cargarStaff();
  }, []);

  const dniError = form.dni && !validateDni(form.dni) ? "El DNI debe tener 8 números" : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setShowPassword(false);
  };

  const handleEdit = (fila) => {
    setForm(fila);
    setMostrarFormCrearUsuario(true);
  };

  const handleDelete = async (fila) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario: ${fila.name} ${fila.lastname}?`)) {
      try {
        await UsersAPI.deleteStaffById(fila._id);
        triggerToast("🗑️ Usuario eliminado");
        cargarStaff();
      } catch (err) {
        alert("❌ Error al eliminar usuario");
      }
    }
  };

  const handleToggle = async (fila) => {
    const accion = fila.isActive ? "deshabilitar" : "habilitar";
    const icono = fila.isActive ? "⛔" : "✅";

    const confirmado = window.confirm(`¿Deseas ${accion} al usuario: ${fila.name} ${fila.lastname}?`);
    if (!confirmado) return;

    try {
      const response = fila.isActive
        ? await UsersAPI.deactivateEstado(fila._id)
        : await UsersAPI.activateEstado(fila._id);

      if (response?.status !== 200) {
        alert(response?.data?.error || "Error al actualizar el estado del usuario.");
        return;
      }

      triggerToast(
        `${icono} ${fila.name} ${fila.lastname} ha sido ${fila.isActive ? "deshabilitado" : "habilitado"}`,
      );
      cargarStaff({ resetPage: false });
    } catch (err) {
      alert(err?.message || "Error al actualizar el estado del usuario.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form._id) {
      const missingField = requiredCreateFields.find((field) => !String(form[field.key] || "").trim());
      if (missingField) {
        alert(`El campo ${missingField.label} es obligatorio`);
        return;
      }
    }

    if (!validateDni(form.dni)) {
      alert("El DNI debe tener 8 números");
      return;
    }

    if (!form._id && !validateEmail(form.email || "")) {
      alert("El email debe tener un formato válido");
      return;
    }

    if (!form._id) {
      const passwordError = validatePasswordRules(form.password || "");
      if (passwordError) {
        alert(passwordError);
        return;
      }
    }

    if (form._id) {
      setShowEditModal(true);
    } else {
      try {
        const response = await UsersAPI.createStaff(form);
        if (response.status === 200 || response.status === 201) {
          triggerToast("✅ Usuario creado correctamente");
          resetForm();
          cargarStaff();
        } else {
          alert("Error al crear usuario: " + (response.data?.error || response.data?.message || "Error desconocido"));
        }
      } catch (error) {
        alert("Error en la solicitud: " + error.message);
      }
    }
  };

  const handleUpdateConfirmed = async () => {
    try {
      console.log(form);
      const response = await UsersAPI.updateUserProfileByDni(form.dni, form);
      if (response.status === 200 || response.status === 201) {
        triggerToast("✅ Usuario actualizado correctamente");
        setShowEditModal(false);
        resetForm();
        setMostrarFormCrearUsuario(false);
        cargarStaff({ resetPage: false });
      } else {
        alert("❌ Error al actualizar usuario: " + (response.data?.message || "Error desconocido"));
      }
    } catch (error) {
      alert("❌ Error en la solicitud: " + error.message);
    }
  };

  const handleSearch = (filters) => {
    const normalizedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      acc[key] = String(value || "").trim().toLowerCase();
      return acc;
    }, {});

    const hasFilters = Object.values(normalizedFilters).some(Boolean);
    if (!hasFilters) {
      setProfesores(staffCompleto);
      setPage(1);
      return;
    }

    const filteredStaff = staffCompleto.filter((staff) => {
      const createdAt = staff.createdAt ? new Date(staff.createdAt).toISOString().slice(0, 10) : "";

      return (
        (!normalizedFilters.dni || String(staff.dni || "").toLowerCase().includes(normalizedFilters.dni)) &&
        (!normalizedFilters.name || String(staff.name || "").toLowerCase().includes(normalizedFilters.name)) &&
        (!normalizedFilters.lastname || String(staff.lastname || "").toLowerCase().includes(normalizedFilters.lastname)) &&
        (!normalizedFilters.email || String(staff.email || "").toLowerCase().includes(normalizedFilters.email)) &&
        (!normalizedFilters.phone || String(staff.cellphone || "").toLowerCase().includes(normalizedFilters.phone)) &&
        (!normalizedFilters.createdAt || createdAt.includes(normalizedFilters.createdAt)) &&
        (!normalizedFilters.role || staff.role === normalizedFilters.role)
      );
    });

    setProfesores(filteredStaff);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(profesores.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const profesoresPaginados = profesores.slice(startIndex, startIndex + pageSize);

  return (
    <div className="max-w-6xl mx-auto p-2 flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-0">
        Gestión de Profesores
      </h2>
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold mb-4">¿Confirmar cambios?</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
              {Object.entries(form).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <Button color="gray" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button color="warning" onClick={handleUpdateConfirmed}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast className="px-8 py-8 text-base font-xl shadow-lg rounded-lg max-w-md">
            {showToast}
            <HiCheck className="h-5 w-5" />
          </Toast>
        </div>
      )}

      <SearchForm ref={searchRef} onSearch={handleSearch} />

      <div className="mt-6 flex justify-start">
        <Button color="blue" onClick={() => setMostrarFormCrearUsuario((prev) => !prev)}>
          {mostrarFormCrearUsuario ? "⇦ Ocultar formulario" : "➕ Crear Usuario"}
        </Button>
      </div>

      {mostrarFormCrearUsuario && (
        <Card className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dni-input" value="DNI" />
              <TextInput
                id="dni-input"
                name="dni"
                value={form.dni}
                disabled={Boolean(form._id)}
                onChange={handleChange}
                maxLength={8}
                inputMode="numeric"
                className={`w-full rounded border text-sm bg-gray-800 text-white focus:border-blue-500 focus:ring-blue-500
              ${dniError ? "border-red-500 ring-red-500" : "border-gray-600"}`}
                required
              />
            </div>
            {["name", "lastname", "cellphone", "email"].map((field) => (
              <div key={field}>
                <Label htmlFor={`${field}-input`} value={field.toUpperCase()} />
                <TextInput
                  id={`${field}-input`}
                  name={field}
                  value={form[field] || ""}
                  onChange={handleChange}
                  required={field !== "cellphone"}
                />
              </div>
            ))}
            {!form._id && (
              <div className="group relative">
                <Label htmlFor="password" value="Contraseña" />
                <div className="relative">
                  <TextInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password || ""}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 pl-11 dark:bg-gray-700 dark:text-white"
                    required
                    aria-describedby="staff-password-rules"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-cyan-600 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-100">
                    {showPassword ? <HiMiniEyeSlash className="h-5 w-5" /> : <HiMiniEye className="h-5 w-5" />}
                  </button>
                </div>
                <p
                  id="staff-password-rules"
                  className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-max max-w-full rounded-md border border-yellow-300 bg-yellow-100 px-3 py-2 text-xs font-semibold text-yellow-900 shadow-lg group-hover:block group-focus-within:block">
                  {passwordRulesText}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="rol" value="Rol" />

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white"
                required>
                <option value="professor">Profesor</option>
                <option value="preceptor">Preceptor</option>

                <option value="admin">Admin</option>
              </select>
            </div>
            <Button onClick={handleSubmit}>{form._id ? "Actualizar Usuario" : "Crear Usuario"}</Button>
          </div>
        </Card>
      )}

      <Tabla
        datos={Array.isArray(profesoresPaginados) ? profesoresPaginados : []}
        columnas={[
          { clave: "counter", titulo: "#", render: (_, __, index) => startIndex + index + 1 },
          { clave: "dni", titulo: "DNI" },
          { clave: "name", titulo: "Nombre" },
          { clave: "lastname", titulo: "Apellido" },
          { clave: "email", titulo: "Email" },
          { clave: "cellphone", titulo: "Teléfono" },
          { clave: "role", titulo: "Rol" },
          {
            clave: "active",
            titulo: "Activo",
            render: (_, fila) => <ToggleSwitch checked={fila.isActive} onChange={() => handleToggle(fila)} />,
          },
        ]}
        onEditar={handleEdit}
        onEliminar={handleDelete}
        mostrarIconoEditar={true}
        mostrarIconoEliminar={true}
      />
      {profesores.length > 5 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            Mostrar
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-md border border-blue-500/50 bg-gray-800 px-2 py-1 text-blue-100 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400">
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            por página
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-blue-500/50 bg-blue-600/20 px-3 py-1 text-sm text-blue-100 transition hover:bg-blue-600/40 disabled:cursor-not-allowed disabled:opacity-40">
              Anterior
            </button>
            <span className="text-sm text-gray-400">Página {currentPage} de {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-blue-500/50 bg-blue-600/20 px-3 py-1 text-sm text-blue-100 transition hover:bg-blue-600/40 disabled:cursor-not-allowed disabled:opacity-40">
              Siguiente
            </button>
          </div>
        </div>
      )}
      {profesores.length === 0 && (
        <div className="text-center text-lg text-gray-500 dark:text-gray-400 mt-2">
          ⚠️ No se encontraron resultados con los filtros aplicados.
        </div>
      )}
    </div>
  );
}
