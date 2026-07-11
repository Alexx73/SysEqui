import React, { useEffect, useState } from "react";
import TablaReutilizable from "../components/Tabla";

import { UsersAPI } from "../api/UsersAPI";
import { Card, Modal, Button, Label, TextInput } from "flowbite-react";
import PageTitle from "../components/PageTitle";
import { useToast } from "../components/toastContext";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

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
  const [query, setQuery] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAlumno, setEditAlumno] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "lastname", direction: "asc" });

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

  const getStudentByDni = async (dni) => {
    try {
      const res = await UsersAPI.getUsersByDni(dni);
      if (res.data?.user) {
        setAlumno([res.data.user]);
        setPage(1);
        setNoResults(false);
      } else {
        showToast({ message: `No se encontraron resultados para el DNI: ${dni}`, type: "warning" });
        setAlumno([]);
        setNoResults(true);
      }
    } catch (error) {
      showToast({ message: error?.message || "Error al obtener usuario por DNI.", type: "error" });
      setAlumno([]);
      setNoResults(true);
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
      <Card className="mb-4">
        <p className="text-gray-700 dark:text-gray-300"></p>
        <form
          className="flex flex-col md:flex-row gap-4 mb-2 "
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim() !== "") {
              getStudentByDni(query.trim());
            }
          }}>
          <input
            type="text"
            placeholder="Buscar Alumno por DNI"
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded bg-slate-600 text-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="block md:flex gap-2">
            <button className="bg-blue-500 px-4 rounded" type="submit">
              Enviar
            </button>
            <button
              className="bg-red-500 px-4 rounded"
              type="button"
              onClick={() => {
                setQuery("");
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
      />
      {alumno.length > 5 && (
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
