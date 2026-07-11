import { useState, useEffect, useRef } from "react";
import { Card, Button, TextInput, Label, ToggleSwitch } from "flowbite-react";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import SearchForm from "./forms/SearchFom";
import Tabla from "../components/Tabla";
import { UsersAPI } from "../api/UsersAPI";
import { passwordRulesText, validatePasswordRules } from "../utils/passwordValidation";
import PageTitle from "../components/PageTitle";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/toastContext";

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
const sortStaff = (staff = [], sortConfig = { key: "lastname", direction: "asc" }) =>
  [...staff].sort((a, b) => {
    const firstValue = a[sortConfig.key];
    const secondValue = b[sortConfig.key];
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    if (sortConfig.key === "dni") {
      const firstNumber = Number(firstValue);
      const secondNumber = Number(secondValue);

      if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) {
        return (firstNumber - secondNumber) * direction;
      }
    }

    return (
      String(firstValue || "").localeCompare(String(secondValue || ""), "es", {
        numeric: true,
        sensitivity: "base",
      }) * direction
    );
  });
const requiredCreateFields = [
  { key: "dni", label: "DNI" },
  { key: "name", label: "nombre" },
  { key: "lastname", label: "apellido" },
  { key: "email", label: "email" },
  { key: "password", label: "contraseña" },
];

export default function Profesores() {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [profesores, setProfesores] = useState([]);
  const [staffCompleto, setStaffCompleto] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [mostrarFormCrearUsuario, setMostrarFormCrearUsuario] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: "lastname", direction: "asc" });

  const searchRef = useRef();

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const cargarStaff = async ({ resetPage = true } = {}) => {
    try {
      const res = await UsersAPI.getAllStaff();
      const staff = res.data.staff || [];
      setStaffCompleto(staff);
      setProfesores(staff);
      if (resetPage) setPage(1);
    } catch (err) {
      showToast({ message: err?.message || "Error al cargar staff", type: "error" });
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

  const handleDelete = (fila) => {
    setConfirmModal({
      title: "Eliminar usuario",
      message: `¿Está seguro de eliminar al usuario ${fila.name} ${fila.lastname}?`,
      confirmLabel: "Eliminar",
      confirmColor: "failure",
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await UsersAPI.deleteStaffById(fila._id);
          showToast({ message: "Usuario eliminado", type: "success" });
          cargarStaff();
        } catch (err) {
          showToast({ message: err?.message || "Error al eliminar usuario", type: "error" });
        }
      },
    });
  };

  const handleToggle = (fila) => {
    const accion = fila.isActive ? "deshabilitar" : "habilitar";

    setConfirmModal({
      title: `${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario`,
      message: `¿Deseas ${accion} al usuario ${fila.name} ${fila.lastname}?`,
      confirmLabel: accion.charAt(0).toUpperCase() + accion.slice(1),
      confirmColor: fila.isActive ? "failure" : "success",
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const response = fila.isActive
            ? await UsersAPI.deactivateEstado(fila._id)
            : await UsersAPI.activateEstado(fila._id);

          if (response?.status !== 200) {
            showToast({
              message: response?.data?.error || "Error al actualizar el estado del usuario.",
              type: "error",
            });
            return;
          }

          showToast({
            message: `${fila.name} ${fila.lastname} ha sido ${fila.isActive ? "deshabilitado" : "habilitado"}`,
            type: "success",
          });
          cargarStaff({ resetPage: false });
        } catch (err) {
          showToast({ message: err?.message || "Error al actualizar el estado del usuario.", type: "error" });
        }
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form._id) {
      const missingField = requiredCreateFields.find((field) => !String(form[field.key] || "").trim());
      if (missingField) {
        showToast({ message: `El campo ${missingField.label} es obligatorio`, type: "error" });
        return;
      }
    }

    if (!validateDni(form.dni)) {
      showToast({ message: "El DNI debe tener 8 números", type: "error" });
      return;
    }

    if (!form._id && !validateEmail(form.email || "")) {
      showToast({ message: "El email debe tener un formato válido", type: "error" });
      return;
    }

    if (!form._id) {
      const passwordError = validatePasswordRules(form.password || "");
      if (passwordError) {
        showToast({ message: passwordError, type: "error" });
        return;
      }
    }

    if (form._id) {
      setConfirmModal({
        title: "Confirmar cambios",
        message: `¿Deseas guardar los cambios de ${form.name} ${form.lastname}?`,
        confirmLabel: "Confirmar",
        confirmColor: "warning",
        onConfirm: handleUpdateConfirmed,
      });
    } else {
      try {
        const response = await UsersAPI.createStaff(form);
        if (response.status === 200 || response.status === 201) {
          showToast({ message: "Usuario creado correctamente", type: "success" });
          resetForm();
          cargarStaff();
        } else {
          showToast({
            message: "Error al crear usuario: " + (response.data?.error || response.data?.message || "Error desconocido"),
            type: "error",
          });
        }
      } catch (error) {
        showToast({ message: "Error en la solicitud: " + error.message, type: "error" });
      }
    }
  };

  const handleUpdateConfirmed = async () => {
    closeConfirmModal();
    try {
      const response = await UsersAPI.updateUserProfileByDni(form.dni, form);
      if (response.status === 200 || response.status === 201) {
        showToast({ message: "Usuario actualizado correctamente", type: "success" });
        resetForm();
        setMostrarFormCrearUsuario(false);
        cargarStaff({ resetPage: false });
      } else {
        showToast({
          message: "Error al actualizar usuario: " + (response.data?.message || "Error desconocido"),
          type: "error",
        });
      }
    } catch (error) {
      showToast({ message: "Error en la solicitud: " + error.message, type: "error" });
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
        (!normalizedFilters.role || staff.role === normalizedFilters.role) &&
        (!normalizedFilters.activeStatus ||
          (normalizedFilters.activeStatus === "active" && staff.isActive) ||
          (normalizedFilters.activeStatus === "inactive" && !staff.isActive))
      );
    });

    setProfesores(filteredStaff);
    setPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const profesoresOrdenados = sortStaff(profesores, sortConfig);
  const totalPages = Math.max(1, Math.ceil(profesoresOrdenados.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const profesoresPaginados = profesoresOrdenados.slice(startIndex, startIndex + pageSize);

  return (
    <div className="max-w-6xl mx-auto p-2 flex flex-col gap-6">
      <PageTitle>Gestión de Profesores</PageTitle>
      <ConfirmModal
        open={Boolean(confirmModal)}
        onClose={closeConfirmModal}
        onConfirm={confirmModal?.onConfirm}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmColor={confirmModal?.confirmColor}
      />

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
          { clave: "dni", titulo: "DNI", sortable: true },
          { clave: "name", titulo: "Nombre" },
          { clave: "lastname", titulo: "Apellido", sortable: true },
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
        sortConfig={sortConfig}
        onSort={handleSort}
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
