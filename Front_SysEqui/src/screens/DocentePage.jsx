import React, { useEffect, useState } from "react";
import { TabItem, Tabs } from "flowbite-react";
import TablaReutilizable from "../components/Tabla";
import ModalAlumnos from "../components/ModalAlumnos";
let tabs = ["1ero A", "1ero B", "2do A", "2do B", "3ero C"];
import { CursosAPI } from "../api/CursosAPI";
import { useAlumnosProfesores } from "../utils/useAlumnosProfesores";

import { useUser } from "../context/UserContext";
import { useCursos } from "../utils/useCursos";
import { useMaterias } from "../utils/useMaterias";
import ConfirmModal from "../components/ConfirmModal";
import ModalNota from "../components/ModalNota";

export default function Docente() {
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const { alumnos, profesores, getAlumnosYProfesores } = useAlumnosProfesores();
  const { materias } = useMaterias();
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tieneCursos, setTieneCursos] = useState(true);
  const [cursosAsignados, setCursosAsignados] = useState([]);
  const [alumnoAEditar, setAlumnoAEditar] = useState([]);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [alumnoParaNota, setAlumnoParaNota] = useState(null);
  const [cursoActual, setCursoActual] = useState(null);

  const { userData } = useUser();

  const abrirModalConfirmacion = (alumno, nuevaNota) => {
    setAlumnoEditado(alumno);
    setNuevaNota(nuevaNota);
    setModalAbierto(false);
  };

  const buscarCursos = async () => {
    try {
      const profesor = profesores.find((p) => p.dni === userData.dni);
      if (!profesor) {
        setTieneCursos(false);
        return;
      }

      const response = await CursosAPI.getAllCursos();
      if (response.status === 200) {
        const todosLosCursos = response.data.cursos;

        const cursosDelProfesor = todosLosCursos.filter((curso) =>
          curso.docentesEncargados?.includes(profesor._id),
        );

const cursosConAlumnos = cursosDelProfesor.map((curso) => {
          const alumnosDelCurso = curso.alumnos
            .map((alumnoDelCurso) => {
              const perfilAlumno = alumnos.find(
                (a) => String(a._id) === String(alumnoDelCurso.idAlumno || alumnoDelCurso._id)
              );
              if (!perfilAlumno) return null;
              return {
                ...perfilAlumno,
                nota: alumnoDelCurso.nota ?? 0,
              };
            })
            .filter(Boolean);
          const materia = curso.idMateria
            ? materias.find((m) => String(m._id) === String(curso.idMateria))
            : null;

          return {
            ...curso,
            alumnos: alumnosDelCurso,
            nombreMateria: materia ? materia.name : "Materia desconocida",
            idMateria: curso.idMateria,
          };
        });

        setCursosAsignados(cursosConAlumnos);

        setTieneCursos(cursosConAlumnos.length > 0);
        console.log(cursosAsignados);
      } else {
        setTieneCursos(false);
      }
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      setTieneCursos(false);
    }
  };

  useEffect(() => {
    if (cursosAsignados.length > 0) {
    }
  }, [cursosAsignados]);

  useEffect(() => {
    if (profesores.length > 0 && alumnos.length > 0) {
      buscarCursos();
    }
  }, [profesores, alumnos]);

  const modalConfirmacion = (alumno, materia) => {
    setAlumnoAEditar(alumno);
    setMateriaSeleccionada(materia);
    setModalConfirmacionAbierto(true);
  };

  const handleAprobar = (alumno, curso) => {
    setAlumnoParaNota(alumno);
    setCursoActual(curso);
    setShowNotaModal(true);
  };

const handleConfirmarNota = async (nota) => {
    const res = await CursosAPI.assignNote(cursoActual._id, {
      nota,
      idAlumno: alumnoParaNota._id,
    });

    if (res.status !== 200) {
      alert(res.data?.error || "Error al guardar nota.");
      return;
    }

    alert("Nota guardada correctamente.");
    setShowNotaModal(false);
    buscarCursos();
  };

  return (
    <div className="max-w-screen-lg mx-auto  py-6">
      {tieneCursos && (
        <Tabs aria-label="Default tabs" variant="default">
          {cursosAsignados.map((curso, index) => (
            <TabItem key={index} title={curso.nombreMateria || "Materia desconocida"} className="text-center">
              <TablaReutilizable
                title={curso.idMateria}
                datos={curso.alumnos}
                columnas={[
                  { clave: "lastname", titulo: "Nombre" },
                  { clave: "name", titulo: "Nombre" },
                  { clave: "dni", titulo: "DNI" },
                  { clave: "email", titulo: "Email" },
                  {
                    clave: "nota",
                    titulo: "Nota",
                    editable: true,
                    onEdit: (alumno, nuevaNota) => abrirModalConfirmacion(alumno, nuevaNota),
                  },
                ]}
                mostrarIconoEditar={true}
                mostrarIconoEliminar={true}
                mostrarIconoAprobar={true}
                onAprobar={(alumno) => handleAprobar(alumno, curso)}
                onEditar={modalConfirmacion}
                onEliminar={(alumno) => console.log("Eliminar alumno:", alumno._id, alumno.lastname)}
                onDobleClickFila={modalConfirmacion}
              />
            </TabItem>
          ))}
        </Tabs>
      )}

      <ModalAlumnos
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        alumnos={materiaSeleccionada?.alumno || []}
        nombreMateria={materiaSeleccionada?.nombre}
      />
      <ConfirmModal
        open={modalConfirmacionAbierto}
        onClose={() => setModalConfirmacionAbierto(false)}
        onConfirm={() => {
          setModalConfirmacionAbierto(false);
        }}
        title="Confirmar actualización de nota"
        message={`¿Estás seguro de que quieres actualizar la nota de ${alumnoAEditar?.lastname} ${alumnoAEditar?.name}  ?`}
        oneButton={false}
      />
      <ModalNota
        isOpen={showNotaModal}
        onClose={() => setShowNotaModal(false)}
        onConfirm={handleConfirmarNota}
        title="Cargar Nota"
        nombreAlumno={alumnoParaNota ? `${alumnoParaNota.lastname} ${alumnoParaNota.name}` : ""}
      />
    </div>
  );
}
