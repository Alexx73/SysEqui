import React, { useEffect, useState } from "react";
import { Button, Modal, ToggleSwitch } from "flowbite-react";
import { MateriasAPI } from "../api/MateriasAPI";
import TablaReutilizable from "../components/Tabla";
import MyForm from "./forms/Myform";
import { useMaterias } from "../utils/useMaterias";
import PageTitle from "../components/PageTitle";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/toastContext";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

export default function ListaDeMaterias() {
  const { showToast } = useToast();
  const { materias, loading, fetchMaterias } = useMaterias();
  const [modalOpen, setModalOpen] = useState(false);
  const [datosFormulario, setDatosFormulario] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchMaterias();
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (datosFormulario?._id) {
        const response = await MateriasAPI.modifyMateriaById(datosFormulario._id, data);
        showToast({ message: response?.data?.message || "Materia actualizada", type: "success" });
      } else {
        const response = await MateriasAPI.createMateria(data);
        showToast({ message: response?.data?.message || "Materia creada", type: "success" });
      }

      await fetchMaterias();
      setModalOpen(false);
      setDatosFormulario(null);
    } catch (error) {
      showToast({
        message: error?.response?.data?.error || error?.message || "No se pudo guardar la materia.",
        type: "error",
      });
    }
  };

  const handleEditar = (materia) => {
    setDatosFormulario({
      name: materia.name,
      year: materia.year,
      shift: materia.shift,
      _id: materia._id,
    });
    setModalOpen(true);
  };

  const handleEliminar = (materia) => {
    setConfirmModal({
      title: "Eliminar materia",
      message: `¿Eliminar la materia ${materia.name}?`,
      confirmLabel: "Eliminar",
      confirmColor: "failure",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await MateriasAPI.deleteMateriaById(materia._id);
          showToast({ message: "Materia eliminada", type: "success" });
          await fetchMaterias();
        } catch (error) {
          showToast({
            message: error?.response?.data?.error || error?.message || "Error al eliminar la materia.",
            type: "error",
          });
        }
      },
    });
  };

  const handleToggleActive = async (materia) => {
    try {
      const campos = {
        name: materia.name,
        year: materia.year,
        shift: materia.shift,
        active: !materia.active,
      };
      await MateriasAPI.modifyMateriaById(materia._id, campos);
      await fetchMaterias();
      showToast({
        message: `Materia ${campos.active ? "activada" : "desactivada"} correctamente`,
        type: "success",
      });
    } catch (error) {
      showToast({
        message: error?.response?.data?.error || error?.message || "Error al actualizar el estado de la materia.",
        type: "error",
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(materias.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const materiasPaginadas = materias.slice(startIndex, startIndex + pageSize);

  return (
    <div className="container mx-auto px-2">
      <PageTitle>Lista de Materias para Asignar a Cursos</PageTitle>
      <ConfirmModal
        open={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmModal?.onConfirm}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmColor={confirmModal?.confirmColor}
      />

      <div className="mt-6 flex justify-start">
        <Button color="blue" onClick={() => setModalOpen(true)}>
          + Agregar Materia
        </Button>
      </div>

      <Modal
        className="pt-16"
        show={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setDatosFormulario(null);
        }}>
        <Modal.Header>{datosFormulario?._id ? "Editar Materia" : "Crear Nueva Materia"}</Modal.Header>
        <Modal.Body>
          <MyForm
            campos={[
              { name: "name", label: "Nombre de la Materia", type: "text", required: true },
              { name: "year", label: "Año", type: "number", required: true },
            ]}
            onSubmit={handleSubmit}
            datosIniciales={datosFormulario}
            setDatosFormulario={setDatosFormulario}
            setModalOpen={setModalOpen}
          />
        </Modal.Body>
      </Modal>

      <div className="mt-6">
        {loading ? (
          <p className="text-center">Cargando materias...</p>
        ) : (
          <TablaReutilizable
            datos={materiasPaginadas}
            columnas={[
              { clave: "name", titulo: "Nombre" },
              { clave: "year", titulo: "Año" },
              {
                clave: "active",
                titulo: "Estado",
                render: (_, fila) => (
                  <ToggleSwitch checked={fila.active} onChange={() => handleToggleActive(fila)} />
                ),
              },
            ]}
            mostrarIconoEditar={true}
            mostrarIconoEliminar={true}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}

        {!loading && materias.length > 5 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
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
                  <option key={option} value={option}>
                    {option}
                  </option>
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
              <span className="text-sm text-gray-400">
                Página {currentPage} de {totalPages}
              </span>
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
      </div>
    </div>
  );
}
