// src/components/ModalAlumnos.jsx
import { Modal, ModalHeader, ModalBody, Button, Label, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import TablaReutilizable from "./Tabla";

export default function ModalAlumnos({ open, onClose, alumnos = [], nombreMateria = "" }) {
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [nota, setNota] = useState("");
  const [alumnosConNota, setAlumnosConNota] = useState([]);

  const handleEditar = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setNota(alumno.nota ?? ""); // precargar nota si existe
    setModalEditarAbierto(true);
  };

  const handleGuardarNota = () => {
    const actualizados = alumnosConNota.map((al) =>
      al.dni === alumnoSeleccionado.dni ? { ...al, nota: Number(nota) } : al,
    );
    setAlumnosConNota(actualizados);
    setModalEditarAbierto(false);
  };

  useEffect(() => {
    setAlumnosConNota(alumnos);
  }, [alumnos]);

  return (
    <>
      <Modal show={open} onClose={onClose} size="4xl">
        <ModalHeader>Alumnos de {nombreMateria}</ModalHeader>
        <ModalBody>
          {alumnos.length === 0 ? (
            <p className="text-center text-gray-500">No hay alumnos en esta materia.</p>
          ) : (
            <TablaReutilizable
              datos={alumnosConNota}
              columnas={[
                { clave: "nombre", titulo: "Nombre" },
                { clave: "apellido", titulo: "Apellido" },
                { clave: "dni", titulo: "DNI" },
                // { clave: "email", titulo: "Email" },
                { clave: "telefono", titulo: "Teléfono" },
                { clave: "nota", titulo: "Nota" },
                { clave: "estado", titulo: "Estado" },
              ]}
              mostrarIconoEditar={true}
              onEditar={handleEditar}
              mostrarIconoEliminar={false}
              mostrarLinks={false}
              mostrarIconoActivo={false}
              linkMateria={false}
            />
          )}
        </ModalBody>
      </Modal>

      {/* ➕ Modal para Editar Nota */}
      <Modal show={modalEditarAbierto} onClose={() => setModalEditarAbierto(false)} size="sm">
        <ModalHeader>
          Asignar nota a {alumnoSeleccionado?.nombre} {alumnoSeleccionado?.apellido}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4 text-white-200">
            <p>
              <strong>DNI:</strong> {alumnoSeleccionado?.dni}
            </p>
            <p>
              <strong>Email:</strong> {alumnoSeleccionado?.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {alumnoSeleccionado?.telefono}
            </p>

            <div>
              <Label htmlFor="nota" value="Nota (1 a 10)" />
              <TextInput
                className="w-1/3"
                id="nota"
                type="number"
                min={1}
                max={10}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                required
              />
            </div>

            <Button className="mt-4" onClick={handleGuardarNota}>
              Guardar Nota
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
