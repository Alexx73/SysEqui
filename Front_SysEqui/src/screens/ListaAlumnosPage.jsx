import React, { useEffect, useState } from "react";
import TablaReutilizable from "../components/Tabla";

import { UsersAPI } from "../api/UsersAPI";
import { Card, Modal, Button, Label, TextInput } from "flowbite-react";

const sortAlumnosByLastname = (alumnos = []) =>
  [...alumnos].sort((a, b) => String(a.lastname || "").localeCompare(String(b.lastname || "")));

export default function ListaAlumnos() {
  const [alumno, setAlumno] = useState([]);
  const [alumnosOriginal, setAlumnoOriginal] = useState([]);

  const [noResults, setNoResults] = useState(false);
  const [query, setQuery] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editAlumno, setEditAlumno] = useState(null);

  const cargarAlumnos = async () => {
    try {
      const res = await UsersAPI.getAllUsers();
      if (res?.status === 200) {
        const alumnos = sortAlumnosByLastname((res.data?.users || []).filter((user) => user.role === "student"));
        setAlumno(alumnos);
        setAlumnoOriginal(alumnos);
        setNoResults(alumnos.length === 0);
        return;
      }
      setAlumno([]);
      setAlumnoOriginal([]);
      setNoResults(true);
    } catch (error) {
      console.error("Error al cargar alumnos: " + error.message);
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
        setNoResults(false);
      } else {
        alert("⚠️ No se encontraron resultados para el DNI: " + dni);
        setAlumno([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error("❌ Error al obtener Usuario por DNI:", error.message);
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
        return;
      }
      alert(res?.data?.error || "No se pudo actualizar el alumno");
    } catch (error) {
      console.error("Error al actualizar alumno: " + error.message);
      alert("No se pudo actualizar el alumno");
    }
  };
  const onEdit = (fila) => {
    setEditAlumno(fila);
    setShowEditModal(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col gap-4">
      <h2 className="text-3xl font-bold mb-4 text-center">Lista de Alumnos</h2>
      <Card className="mb-8">
        <p className="text-gray-700 dark:text-gray-300"></p>
        <form
          className="flex flex-col md:flex-row gap-4 mb-4 py-6"
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
              }}>
              Limpiar
            </button>
          </div>
        </form>
      </Card>

      <TablaReutilizable
        datos={alumno}
        columnas={[
          { clave: "counter", titulo: "#", render: (_, __, index) => index + 1 },
          { clave: "lastname", titulo: "Apellido" },
          { clave: "name", titulo: "Nombre" },

          { clave: "dni", titulo: "DNI" },
          { clave: "email", titulo: "Email" },
          { clave: "cellphone", titulo: "Teléfono" },
        ]}
        mostrarIconoEditar={true}
        onDobleClickFila={(fila) => onEdit(fila)}
        onEditar={(fila) => onEdit(fila)}
      />

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