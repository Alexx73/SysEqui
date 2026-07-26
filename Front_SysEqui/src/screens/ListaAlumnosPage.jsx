import React, { useEffect, useState } from "react";
import TablaReutilizable from "../components/Tabla";

import { UsersAPI } from "../api/UsersAPI";
import { Card, Modal, Button, Label, TextInput } from "flowbite-react";
import PageTitle from "../components/PageTitle";
import { useToast } from "../components/toastContext";
import ConfirmModal from "../components/ConfirmModal";
import { HiKey } from "react-icons/hi";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];
const INITIAL_FILTERS = {
  dni: "",
  name: "",
  lastname: "",
  email: "",
  cellphone: "",
};

const FILTER_LABELS = {
  dni: "DNI",
  name: "Nombre",
  lastname: "Apellido",
  email: "Email",
  cellphone: "Teléfono",
};

const normalizeSearchValue = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const sortAlumnos = (alumnos = [], sortConfig = { key: "lastname", direction: "asc" }) =>
  [...alumnos].sort((a, b) => {
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

export default function ListaAlumnos() {
  const { showToast } = useToast();
  const [alumno, setAlumno] = useState([]);
  const [alumnosOriginal, setAlumnoOriginal] = useState([]);

  const [noResults, setNoResults] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAlumno, setEditAlumno] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "lastname", direction: "asc" });
  const [resetUser, setResetUser] = useState(null);

  const cargarAlumnos = async () => {
    try {
      const res = await UsersAPI.getAllUsers();
      if (res?.status === 200) {
        const alumnos = (res.data?.users || []).filter((user) => user.role === "student");
        setAlumno(alumnos);
        setAlumnoOriginal(alumnos);
        setPage(1);
        setNoResults(alumnos.length === 0);
        return;
      }
      setAlumno([]);
      setAlumnoOriginal([]);
      setNoResults(true);
    } catch (error) {
      showToast({ message: error?.message || "Error al cargar alumnos.", type: "error" });
      setAlumno([]);
      setAlumnoOriginal([]);
      setNoResults(true);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const filterStudents = () => {
    const activeFilters = Object.entries(filters)
      .map(([field, value]) => [field, normalizeSearchValue(value)])
      .filter(([, value]) => value !== "");

    if (activeFilters.length === 0) {
      setAlumno(alumnosOriginal);
      setPage(1);
      setNoResults(alumnosOriginal.length === 0);
      return;
    }

    const coincidencias = alumnosOriginal.filter((student) =>
      activeFilters.some(([field, value]) =>
        normalizeSearchValue(student[field]).includes(value),
      ),
    );

    setAlumno(coincidencias);
    setPage(1);
    setNoResults(coincidencias.length === 0);

    if (coincidencias.length === 0) {
      showToast({
        message: "No se encontraron alumnos que coincidan con los filtros.",
        type: "warning",
      });
    }
  };

  const handleConfirmEdit = async () => {
    try {
      const res = await UsersAPI.updateUserProfileByDni(editAlumno.dni, editAlumno);
      if (res?.status === 200) {
        setAlumno((current) => current.map((item) => (item.dni === editAlumno.dni ? editAlumno : item)));
        setAlumnoOriginal((current) => current.map((item) => (item.dni === editAlumno.dni ? editAlumno : item)));
        setShowEditModal(false);
        showToast({ message: "Alumno actualizado correctamente", type: "success" });
        return;
      }
      showToast({ message: res?.data?.error || "No se pudo actualizar el alumno", type: "error" });
    } catch (error) {
      showToast({ message: error?.message || "No se pudo actualizar el alumno", type: "error" });
    }
  };
  const onEdit = (fila) => {
    setEditAlumno(fila);
    setShowEditModal(true);
  };

  const confirmPasswordReset = async () => {
    const selected = resetUser;
    setResetUser(null);
    const response = await UsersAPI.requestPasswordReset(selected.dni);
    if (response?.status === 200) {
      showToast({ message: `Restablecimiento habilitado por 24 horas para ${selected.name} ${selected.lastname}`, type: "success" });
    } else {
      showToast({ message: response?.data?.error || "No se pudo solicitar el restablecimiento", type: "error" });
    }
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const alumnosOrdenados = sortAlumnos(alumno, sortConfig);
  const totalPages = Math.max(1, Math.ceil(alumnosOrdenados.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const alumnosPaginados = alumnosOrdenados.slice(startIndex, startIndex + pageSize);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col gap-4">
      <PageTitle>Lista de Alumnos</PageTitle>
      <ConfirmModal
        open={Boolean(resetUser)}
        onClose={() => setResetUser(null)}
        onConfirm={confirmPasswordReset}
        title="Restablecer contraseña"
        message={`¿Habilitar durante 24 horas el cambio de contraseña de ${resetUser?.name || ""} ${resetUser?.lastname || ""} (DNI ${resetUser?.dni || ""})? Durante ese período, quien conozca el DNI podrá establecer una contraseña nueva.`}
        confirmLabel="Restablecer"
        confirmColor="warning"
      />
      <Card className="mb-4">
        <form
          className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            filterStudents();
          }}>
          {Object.keys(INITIAL_FILTERS).map((field) => (
            <label key={field} className="flex min-w-0 flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {FILTER_LABELS[field]}
              <input
                type="text"
                name={field}
                placeholder={`Buscar por ${FILTER_LABELS[field].toLowerCase()}`}
                className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-gray-400"
                value={filters[field]}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, [field]: event.target.value }))
                }
              />
            </label>
          ))}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-5 lg:justify-end">
            <button className="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600" type="submit">
              Buscar
            </button>
            <button
              className="rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
              type="button"
              onClick={() => {
                setFilters(INITIAL_FILTERS);
                setNoResults(false);
                setAlumno(alumnosOriginal);
                setPage(1);
              }}>
              Limpiar
            </button>
          </div>
        </form>
      </Card>

      <TablaReutilizable
        datos={alumnosPaginados}
        columnas={[
          { clave: "counter", titulo: "#", render: (_, __, index) => startIndex + index + 1 },
          { clave: "lastname", titulo: "Apellido", sortable: true },
          { clave: "name", titulo: "Nombre" },

          { clave: "dni", titulo: "DNI", sortable: true },
          { clave: "email", titulo: "Email" },
          { clave: "cellphone", titulo: "Teléfono" },
        ]}
        mostrarIconoEditar={true}
        onDobleClickFila={(fila) => onEdit(fila)}
        onEditar={(fila) => onEdit(fila)}
        sortConfig={sortConfig}
        onSort={handleSort}
        accionesAdicionales={[
          {
            label: "Restablecer contraseña",
            icono: HiKey,
            onClick: setResetUser,
            className: "rounded bg-violet-600 p-1 text-white hover:bg-violet-700",
          },
        ]}
      />
      {alumno.length > 5 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            Mostrar
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-md border border-blue-300 bg-white px-2 py-1 text-blue-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-500/50 dark:bg-gray-800 dark:text-blue-100 dark:focus:border-blue-400 dark:focus:ring-blue-400">
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
              className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1 text-sm text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-500/50 dark:bg-blue-600/20 dark:text-blue-100 dark:hover:bg-blue-600/40">
              Anterior
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Página {currentPage} de {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1 text-sm text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-500/50 dark:bg-blue-600/20 dark:text-blue-100 dark:hover:bg-blue-600/40">
              Siguiente
            </button>
          </div>
        </div>
      )}

      <div>
        <Modal
          show={showEditModal}
          size="md"
          onClose={() => setShowEditModal(false)}>
          <Modal.Header>Editar Alumno</Modal.Header>
          <Modal.Body>
            {editAlumno && (
              <form className="flex  flex-col gap-4">
                <div>
                  <Label htmlFor="lastname" value="Apellido" />
                  <TextInput
                    id="lastname"
                    value={editAlumno.lastname}
                    onChange={(e) => setEditAlumno({ ...editAlumno, lastname: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name" value="Nombre" />
                  <TextInput
                    id="name"
                    value={editAlumno.name}
                    onChange={(e) => setEditAlumno({ ...editAlumno, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dni" value="DNI" />
                  <TextInput
                    id="dni"
                    value={editAlumno.dni}
                    onChange={(e) => setEditAlumno({ ...editAlumno, dni: e.target.value })}
                    required
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="email" value="Email" />
                  <TextInput
                    id="email"
                    value={editAlumno.email}
                    onChange={(e) => setEditAlumno({ ...editAlumno, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cellphone" value="Teléfono" />
                  <TextInput
                    id="cellphone"
                    value={editAlumno.cellphone}
                    onChange={(e) => setEditAlumno({ ...editAlumno, cellphone: e.target.value })}
                    required
                  />
                </div>
              </form>
            )}
          </Modal.Body>
          <Modal.Footer className="flex justify-center  gap-4">
            <Button color="warning" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button color="success" onClick={handleConfirmEdit}>
              Confirmar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
