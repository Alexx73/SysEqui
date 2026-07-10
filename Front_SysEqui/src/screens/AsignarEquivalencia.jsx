import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Accordion, Button, Card, Select } from "flowbite-react";

import { useMaterias } from "../utils/useMaterias";
import { useCursosAlumno } from "../utils/useCursosAlumno";
import { UsersAPI } from "../api/UsersAPI";
import { PendientesAPI } from "../api/Pendientes";
import { CursosAPI } from "../api/CursosAPI";
import TablaReutilizable from "../components/Tabla";
import ModalNota from "../components/ModalNota";
import PageTitle from "../components/PageTitle";

export default function AsignarEquivalencia() {
  const { materias } = useMaterias();
  const location = useLocation();
  const navigate = useNavigate();

  const [dniAlumno, setDniAlumno] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [materiasAsignadas, setMateriasAsignadas] = useState([]);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [materiaParaNota, setMateriaParaNota] = useState(null);
  const [cursoParaNota, setCursoParaNota] = useState(null);

  const { cursosDelAlumno, fetchCursosByAlumnoId } = useCursosAlumno(materias);

  useEffect(() => {
    if (location.state?.dniAlumno) {
      const dni = location.state.dniAlumno;
      setDniAlumno(dni);
      buscarAlumnoPorDni(null, dni);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const fetchMateriasAsignadas = async (alumnoId) => {
    try {
      const res = await PendientesAPI.getPendientesAll();
      const asignadas = res.data.equivalencias?.filter((m) => m.userId === alumnoId) || [];
      setMateriasAsignadas(asignadas);
      console.log(materiasAsignadas);
    } catch {
      alert("Error al obtener materias asignadas.");
    }
};

  const buscarAlumnoPorDni = async (e, dniParam = null) => {
    if (e) e.preventDefault();
    const dni = dniParam || dniAlumno;
    if (!dni) return;

    try {
      const res = await UsersAPI.getUsersByDni(dni);
      const alumno = res?.data?.user;
      if (alumno) {
        setAlumnoSeleccionado(alumno);
        setShowConfirmModal(true);
      } else {
        alert("Alumno no encontrado.");
      }
    } catch {
      alert("Error al buscar el alumno.");
    }
  };

  const confirmarAlumnoSeleccionado = async () => {
    setShowConfirmModal(false);
    setDniAlumno("");
    if (alumnoSeleccionado?._id) {
      await fetchMateriasAsignadas(alumnoSeleccionado._id);
      await fetchCursosByAlumnoId(alumnoSeleccionado._id);
    }
  };

  useEffect(() => {
    const keyListener = (e) => {
      if (showConfirmModal && e.key === "Enter") {
        e.preventDefault();
        confirmarAlumnoSeleccionado();
      } else if (showConfirmModal && e.key === "Escape") {
        setShowConfirmModal(false);
        document.getElementById("dni").focus();
      }
    };
    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, [showConfirmModal]);

  const handleAsignarMateria = async () => {
    if (!materiaSeleccionada || !alumnoSeleccionado) return;

    const materia = materias.find((m) => m._id === materiaSeleccionada);
    if (!materia) return alert("Materia no encontrada.");

    const yaAsignada = materiasAsignadas.some(
      (m) => m.name.trim().toLowerCase() === materia.name.trim().toLowerCase(),
    );
    if (yaAsignada) return alert("Esta materia ya fue asignada a este alumno !!.");

    const confirmar = window.confirm(
      `¿Asignar materia "${materia.name}" a ${alumnoSeleccionado.lastname} ${alumnoSeleccionado.name}?`,
    );
    if (!confirmar) return;

    try {
      await PendientesAPI.createPendiente({
        name: materia.name,
        year: materia.year,
        userId: alumnoSeleccionado._id,
      });
      alert("Materia asignada correctamente.");
      setMateriaSeleccionada("");
      await fetchMateriasAsignadas(alumnoSeleccionado._id);
    } catch {
      alert("Error al asignar materia.");
    }
  };

  const materiasOrdenadas = [...materiasAsignadas]
    .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
    .map((m, i) => ({
      ...m,
      numero: i + 1,
      createdAt: new Date(m.createdAt).toLocaleDateString("es-AR"),
    }));

  const handleEliminar = async (materia) => {
    const confirmar = window.confirm(
      `¿Eliminar la materia "${materia.name}" asignada a ${alumnoSeleccionado.lastname} ${alumnoSeleccionado.name}?`,
    );
    if (!confirmar) return;
    try {
      await PendientesAPI.deletePendiente(materia._id);
      alert("Materia eliminada correctamente.");
      await fetchMateriasAsignadas(alumnoSeleccionado._id);
    } catch {
      alert("Error al eliminar materia.");
    }
  };

  const handleAprobar = (materia) => {
    setMateriaParaNota(materia);
    setShowNotaModal(true);
  };

  const handleConfirmarNota = async (nota) => {
    if (!materiaParaNota || !alumnoSeleccionado) return;

    const res = await CursosAPI.assignNote(materiaParaNota._id, {
      nota,
      idAlumno: alumnoSeleccionado._id,
    });

    if (res.status !== 200) {
      alert(res.data?.error || "Error al asignar nota.");
      return;
    }

    alert("Nota asignada correctamente.");
    setShowNotaModal(false);
    setMateriaParaNota(null);
    await fetchMateriasAsignadas(alumnoSeleccionado._id);
  };

  const handleAprobarCurso = (curso) => {
    setCursoParaNota(curso);
    setMateriaParaNota(null);
    setShowNotaModal(true);
  };

  const handleConfirmarNotaCurso = async (nota) => {
    if (!cursoParaNota || !alumnoSeleccionado) return;

    const res = await CursosAPI.assignNote(cursoParaNota._id, {
      nota,
      idAlumno: alumnoSeleccionado._id,
    });

    if (res.status !== 200) {
      alert(res.data?.error || "Error al asignar nota.");
      return;
    }

    alert("Nota guardada correctamente.");
    setShowNotaModal(false);
    setCursoParaNota(null);
    await fetchCursosByAlumnoId(alumnoSeleccionado._id);
  };

  return (
    <div className="max-w-4xl mx-auto ">
      <PageTitle>Asignar Equivalencias</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Card 1 */}
        <Card className="h-full flex flex-col justify-between p-6">
          <form
            onSubmit={buscarAlumnoPorDni}
            className="flex flex-col items-center gap-4 h-full justify-center">
            <label htmlFor="dni" className="text-sm font-medium text-gray-400 self-start">
              DNI del Alumno
            </label>
            <input
              id="dni"
              value={dniAlumno}
              onChange={(e) => setDniAlumno(e.target.value)}
              className="p-2 w-full border dark:bg-slate-600 border-gray-300 rounded-md"
              placeholder="Ingrese el DNI del alumno"
              maxLength={8}
            />
            <Button className="w-full" type="submit" color="blue" disabled={!dniAlumno}>
              Buscar Alumno
            </Button>
          </form>
        </Card>

        {/* Card 2 */}
        <Card className="h-full flex flex-col justify-between p-6">
          <div className="flex flex-col items-center gap-4 h-full justify-center">
            <p className="text-sm font-bold self-start">
              {alumnoSeleccionado
                ? `${alumnoSeleccionado.lastname} ${alumnoSeleccionado.name} - DNI: ${alumnoSeleccionado.dni}`
                : "No seleccionado"}
            </p>

            <Select
              className="w-full"
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}>
              <option value="">Seleccionar materia</option>
              {materias.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} - ({m.year})
                </option>
              ))}
            </Select>

            <Button
              className="w-full"
              color="yellow"
              onClick={handleAsignarMateria}
              disabled={!alumnoSeleccionado || !materiaSeleccionada}>
              Asignar Materia
            </Button>
          </div>
        </Card>
      </div>

      {alumnoSeleccionado && (
        <Card className="mt-4">
          {materiasOrdenadas.length > 0 ? (
            <Accordion collapseAll>
              <Accordion.Panel>
                <Accordion.Title>Equivalencias pendientes</Accordion.Title>
                <Accordion.Content>
                  <TablaReutilizable
                    datos={materiasOrdenadas}
                    columnas={[
                      { clave: "numero", titulo: "#" },
                      { clave: "name", titulo: "Materia" },
                      { clave: "year", titulo: "Año" },
                      { clave: "createdAt", titulo: "Fecha de asignación" },
                    ]}
                    // mostrarIconoAprobar={true}
                    mostrarIconoEliminar={true}
                    onAprobar={handleAprobar}
                    onEliminar={handleEliminar}
                  />
                </Accordion.Content>
              </Accordion.Panel>
            </Accordion>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-4">Equivalencias pendientes</h3>
              <p className="text-gray-400">No tiene equivalencias pendientes.</p>
            </>
          )}
        </Card>
      )}

      {alumnoSeleccionado && (
        <Card className="mt-4 border border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20">
          {cursosDelAlumno.length > 0 ? (
            <Accordion className="border-blue-200 dark:border-blue-700">
              <Accordion.Panel>
                <Accordion.Title className="text-blue-800 dark:text-blue-200">
                  Cursos asignados
                </Accordion.Title>
                <Accordion.Content>
                  <TablaReutilizable
                    datos={cursosDelAlumno.map((curso, i) => ({ ...curso, numero: i + 1 }))}
                    columnas={[
                      { clave: "numero", titulo: "#" },
                      { clave: "nombre", titulo: "Materia" },
                      { clave: "año", titulo: "Año" },
                      { clave: "nota", titulo: "Nota" },
                    ]}
                    mostrarIconoAprobar={true}
                    onAprobar={handleAprobarCurso}
                  />
                </Accordion.Content>
              </Accordion.Panel>
            </Accordion>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">
                Cursos asignados
              </h3>
              <p className="text-blue-700/70 dark:text-blue-300/70">No tiene cursos asignados.</p>
            </>
          )}
        </Card>
      )}

      {showConfirmModal && alumnoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold mb-4">
              ¿Confirmar selección de alumno{" "}
              {`${alumnoSeleccionado.lastname} ${alumnoSeleccionado.name} (DNI: ${alumnoSeleccionado.dni})`}?
            </h3>
            <div className="flex justify-end gap-2">
              <Button color="gray" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </Button>
              <Button color="warning" onClick={confirmarAlumnoSeleccionado}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      <ModalNota
        isOpen={showNotaModal}
        onClose={() => {
          setShowNotaModal(false);
          setMateriaParaNota(null);
          setCursoParaNota(null);
        }}
        onConfirm={cursoParaNota ? handleConfirmarNotaCurso : handleConfirmarNota}
        title={`Cargar Nota - ${materiaParaNota?.name || cursoParaNota?.nombre || ""}`}
        nombreAlumno={alumnoSeleccionado ? `${alumnoSeleccionado.lastname} ${alumnoSeleccionado.name}` : ""}
        añoMateria={materiaParaNota?.year || cursoParaNota?.year || ""}
      />
    </div>
  );
}

