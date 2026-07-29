import React, { useEffect, useState } from "react";
import { TabItem, Tabs } from "flowbite-react";
import TablaReutilizable from "../components/Tabla";
import { CursosAPI } from "../api/CursosAPI";
import { useAlumnosProfesores } from "../utils/useAlumnosProfesores";

import { useUser } from "../context/UserContext";
import { useCursos } from "../utils/useCursos";
import { useMaterias } from "../utils/useMaterias";
import ModalNota from "../components/ModalNota";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/toastContext";

export default function Docente() {
  const { showToast } = useToast();
  const { alumnos, profesores, getAlumnosYProfesores } = useAlumnosProfesores();
  const { materias } = useMaterias();
  const [tieneCursos, setTieneCursos] = useState(true);
  const [cursosAsignados, setCursosAsignados] = useState([]);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [alumnoParaNota, setAlumnoParaNota] = useState(null);
  const [cursoActual, setCursoActual] = useState(null);
  const [notaPendiente, setNotaPendiente] = useState(null);
  const [guardandoNota, setGuardandoNota] = useState(false);

  const { userData } = useUser();

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
      } else {
        setTieneCursos(false);
      }
    } catch (error) {
      showToast({ message: error?.message || "Error al obtener los cursos.", type: "error" });
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

  const handleAprobar = (alumno, curso) => {
    setAlumnoParaNota(alumno);
    setCursoActual(curso);
    setShowNotaModal(true);
  };

  const guardarNota = async (nota) => {
    if (guardandoNota) return;
    setGuardandoNota(true);
    const res = await CursosAPI.assignNote(cursoActual._id, {
      nota,
      idAlumno: alumnoParaNota._id,
    });
    setGuardandoNota(false);

    if (res?.status !== 200) {
      showToast({ message: res?.data?.error || "Error al guardar nota.", type: "error" });
      return;
    }

    showToast({ message: "Nota guardada correctamente.", type: "success" });
    setShowNotaModal(false);
    setNotaPendiente(null);
    await buscarCursos();
  };

  const handleConfirmarNota = (nota) => {
    const notaActual = Number(alumnoParaNota?.nota ?? 0);
    if (notaActual === nota) {
      showToast({ message: "La nota ingresada es igual a la nota actual.", type: "info" });
      setShowNotaModal(false);
      return;
    }
    if (notaActual > 0) {
      setShowNotaModal(false);
      setNotaPendiente(nota);
      return;
    }
    guardarNota(nota);
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
                  {
                    clave: "numeroFila",
                    titulo: "#",
                    claseMovil: "w-[8%] whitespace-nowrap text-center md:w-auto",
                    render: (_valor, _alumno, filaIndex) => filaIndex + 1,
                  },
                  {
                    clave: "alumnoMovil",
                    titulo: "Alumno",
                    soloMovil: true,
                    claseMovil: "w-[34%]",
                    render: (_valor, alumno) => `${alumno.lastname} ${alumno.name}`,
                  },
                  { clave: "lastname", titulo: "Apellido", ocultarEnMovil: true },
                  { clave: "name", titulo: "Nombre", ocultarEnMovil: true },
                  { clave: "dni", titulo: "DNI", claseMovil: "w-[29%] whitespace-nowrap md:w-auto" },
                  { clave: "email", titulo: "Email", ocultarEnMovil: true },
                  {
                    clave: "nota",
                    titulo: "Nota",
                    claseMovil: "w-[15%] whitespace-nowrap text-center md:w-auto md:text-left",
                  },
                ]}
                mostrarIconoAprobar={true}
                compactaEnMovil={true}
                onAprobar={(alumno) => handleAprobar(alumno, curso)}
                pieTabla={
                  <div className="grid grid-cols-3 overflow-hidden rounded-lg text-center shadow">
                    <div className="min-w-0 bg-green-100 px-1 py-2 text-green-900 dark:bg-green-900 dark:text-white md:px-3">
                      <span className="whitespace-nowrap text-xs font-bold sm:text-sm">
                        Aprobados: {curso.alumnos.filter((alumno) => Number(alumno.nota) >= 6).length}
                      </span>
                    </div>
                    <div className="min-w-0 bg-red-100 px-1 py-2 text-red-900 dark:bg-red-900 dark:text-white md:px-3">
                      <span className="whitespace-nowrap text-xs font-bold sm:text-sm">
                        No aprobados: {curso.alumnos.filter((alumno) => Number(alumno.nota) < 6).length}
                      </span>
                    </div>
                    <div className="min-w-0 bg-blue-100 px-1 py-2 text-blue-900 dark:bg-blue-900 dark:text-white md:px-3">
                      <span className="whitespace-nowrap text-xs font-bold sm:text-sm">
                        Total alumnos: {curso.alumnos.length}
                      </span>
                    </div>
                  </div>
                }
              />
            </TabItem>
          ))}
        </Tabs>
      )}

      <ModalNota
        isOpen={showNotaModal}
        onClose={() => setShowNotaModal(false)}
        onConfirm={handleConfirmarNota}
        title={Number(alumnoParaNota?.nota ?? 0) > 0 ? "Cambiar nota" : "Cargar nota"}
        nombreAlumno={alumnoParaNota ? `${alumnoParaNota.lastname} ${alumnoParaNota.name}` : ""}
        initialValue={Number(alumnoParaNota?.nota ?? 0) > 0 ? alumnoParaNota.nota : ""}
      />
      <ConfirmModal
        open={notaPendiente !== null}
        onClose={() => setNotaPendiente(null)}
        onConfirm={() => guardarNota(notaPendiente)}
        title="Confirmar cambio de nota"
        message={`¿Cambiar la nota de ${alumnoParaNota?.lastname || ""} ${alumnoParaNota?.name || ""} de ${alumnoParaNota?.nota ?? 0} a ${notaPendiente ?? ""}?`}
        confirmLabel={guardandoNota ? "Guardando..." : "Confirmar cambio"}
        confirmColor="warning"
      />
    </div>
  );
}
