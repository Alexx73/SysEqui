import { useState, useEffect, useRef } from "react";
import { Card, Button, TextInput, Label, ToggleSwitch, Toast } from "flowbite-react";
import { HiCheck } from "react-icons/hi";
import SearchForm from "./forms/SearchFom";
import Tabla from "../components/Tabla";
import { UsersAPI } from "../api/UsersAPI";

const initialForm = {
  dni: "",
  password: "",
  email: "",
  name: "",
  lastname: "",
  cellphone: "",
  role: "profesor",
};

const dniRegex = /^\d{8}$/;
const validateDni = (dni) => /^\d{8}$/.test(dni);

export default function Profesores() {
  const [form, setForm] = useState(initialForm);
  const [profesores, setProfesores] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState("");
  const [mostrarFormCrearUsuario, setMostrarFormCrearUsuario] = useState(false);

  const searchRef = useRef();

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(""), 2000);
  };

  const cargarStaff = async () => {
    try {
      const res = await UsersAPI.getAllStaff();
      setProfesores((res.data.staff || []).sort((a, b) => a.lastname.localeCompare(b.lastname)));
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

  const resetForm = () => setForm(initialForm);

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
      if (fila.isActive) {
        await UsersAPI.deactivateEstado(fila._id);
      } else {
        await UsersAPI.activateEstado(fila._id);
      }

      triggerToast(
        `${icono} ${fila.name} ${fila.lastname} ha sido ${fila.isActive ? "deshabilitado" : "habilitado"}`,
      );
      cargarStaff();
    } catch (err) {
      alert("❌ Error al actualizar el estado del usuario.", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dniError) return;

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
          alert("❌ Error al crear usuario: " + (response.data?.message || "Error desconocido"));
        }
      } catch (error) {
        alert("❌ Error en la solicitud: " + error.message);
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
        cargarStaff();
      } else {
        alert("❌ Error al actualizar usuario: " + (response.data?.message || "Error desconocido"));
      }
    } catch (error) {
      alert("❌ Error en la solicitud: " + error.message);
    }
  };

  const handleSearch = async (filters) => {
    try {
      const res = await UsersAPI.getAllStaff(filters);
      setProfesores((res.data.staff || []).sort((a, b) => a.lastname.localeCompare(b.lastname)));
    } catch (err) {
      setProfesores([]);
    }
  };

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
                disabled
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
                  required
                />
              </div>
            ))}
            {!form._id && (
              <div>
                <Label htmlFor="password" value="Contraseña" />
                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  value={form.password || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white"
                  required
                />
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
        datos={Array.isArray(profesores) ? profesores : []}
        columnas={[
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
      {profesores.length === 0 && (
        <div className="text-center text-lg text-gray-500 dark:text-gray-400 mt-2">
          ⚠️ No se encontraron resultados con los filtros aplicados.
        </div>
      )}
    </div>
  );
}