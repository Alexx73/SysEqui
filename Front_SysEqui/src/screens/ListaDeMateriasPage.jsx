import React, { useEffect, useState } from "react";
import { MateriasAPI } from "../api/MateriasAPI";
import TablaReutilizable from "../components/Tabla";
import { Button, Card, Modal, ToggleSwitch } from "flowbite-react";
import MyForm from "./forms/Myform";
import { useMaterias } from "../utils/useMaterias";

export default function ListaDeMaterias() {
  const { materias, loading, fetchMaterias } = useMaterias();
  const [modalOpen, setModalOpen] = useState(false);
  const [datosFormulario, setDatosFormulario] = useState(null);
  const [modalContent, setModalContent] = useState({ title: "", message: "", oneButton: true });

  useEffect(() => {
    fetchMaterias();
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (datosFormulario?._id) {
        // Actualizar materia
        const response = await MateriasAPI.modifyMateriaById(datosFormulario._id, data);
        alert("✅ Materia actualizada: " + response.data.message);
      } else {
        // Crear materia nueva
        const response = await MateriasAPI.createMateria(data);
        alert("✅ Materia creada: " + response.data.message);
      }
      await fetchMaterias();
      setModalOpen(false);
      setDatosFormulario(null);
    } catch (error) {
      setModalContent({
        title: "Error",
        message: `❌ No se pudo ${datosFormulario?._id ? "actualizar" : "crear"} la materia.\n${error.message}`,
        oneButton: true,
      });
      setModalOpen(true);
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

  const handleEliminar = async (materia) => {
    if (!window.confirm(`¿Eliminar la materia ${materia.name}?`)) return;
    try {
      await MateriasAPI.deleteMateriaById(materia._id);
      alert("🗑️ Materia eliminada");
      await fetchMaterias();
    } catch (error) {
      alert("❌ Error al eliminar");
    }
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
    } catch (error) {
      alert("Error al actualizar el estado de la materia.");
    }
  };

  return (
    <div className="container mx-auto px-2">
      <h2 className="text-3xl font-bold items-center justify-center text-center">
        Lista de Materias para Asignar a Cursos
      </h2>
      <div className="mt-6 flex justify-start">
        <Button color="blue" onClick={() => setModalOpen(true)}>
          ➕ Agregar Materia
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

      {/* Tabla de materias */}
      <div className="mt-6">
        {loading ? (
          <p className="text-center">Cargando materias...</p>
        ) : (
          <TablaReutilizable
            datos={materias}
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
      </div>
    </div>
  );
}
