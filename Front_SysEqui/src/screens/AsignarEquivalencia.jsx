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
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/toastContext";

export default function AsignarEquivalencia() {
  const { showToast } = useToast();
  const { materias } = useMaterias();
  const location = useLocation();
  const navigate = useNavigate();

  const [dniAlumno, setDniAlumno] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
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
    } catch {
      showToast({ message: "Error al obtener materias asignadas.", type: "error" });
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
        setConfirmModal({
          title: "Confirmar alumno",
          message: `¿Confirmar selección de alumno ${alumno.lastname} ${alumno.name} (DNI: ${alumno.dni})?`,
          confirmLabel: "Confirmar",
          confirmColor: "warning",
          onConfirm: () => confirmarAlumnoSeleccionado(alumno),
        });
      } else {
        showToast({ message: "Alumno no encontrado.", type: "warning" });
      }
    } catch {
      showToast({ message: "Error al buscar el alumno.", type: "error" });
    }
  };

  const confirmarAlumnoSeleccionado = async (alumno = alumnoSeleccionado) => {
    setConfirmModal(null);
    setDniAlumno("");
    if (alumno?._id) {
      await fetchMateriasAsignadas(alumno._id);
      await fetchCursosByAlumnoId(alumno._id);
    }
  };

  const handleAsignarMateria = () => {
    if (!materiaSeleccionada || !alumnoSeleccionado) return;

    const materia = materias.find((m) => m._id === materiaSeleccionada);
    if (!materia) {
      showToast({ message: "Materia no encontrada.", type: "error" });
      return;
    }

    const yaAsignada = materiasAsignadas.some(
      (m) => m.name.trim().toLowerCase() === materia.name.trim().toLowerCase(),
    );
    if (yaAsignada) {
      showToast({ message: "Esta materia ya fue asignada a este alumno.", type: "warning" });
      return;
    }

    setConfirmModal({
      title: "Asignar materia",
      message: `¿Asignar materia "${materia.name}" a ${alumnoSeleccionado.lastname} ${alumnoSeleccionado.name}?`,
      confirmLabel: "Asignar",
      confirmColor: "success",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await PendientesAPI.createPendiente({
            name: materia.name,
            year: materia.year,
            userId: alumnoSeleccionado._id,
          });
          showToast({ message: "Materia asignada correctamente.", type: "success" });
          setMateriaSeleccionada("");
          await fetchMateriasAsignadas(alumnoSeleccionado._id);
        } catch {
          showToast({ message: "Error al asignar materia.", type: "error" });
        }
      },
    });
  };

  const materiasOrdenadas = [...materiasAsignadas]
    .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
    .map((m, i) => ({
      ...m,
      numero: i + 1,
      createdAt: new Date(m.createdAt).toLocaleDateString("es-AR"),
    }));

  const handleEliminar = (materia) => {
    setConfirmModal({
      title: "Eliminar materia",
      message: `¿Eliminar la materia "${materia.name}" asignada a ${alumnoSeleccionado.lastname} ${alumnoSeleccionado.name}?`,
      confirmLabel: "Eliminar",
      confirmColor: "failure",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await PendientesAPI.deletePendiente(materia._id);
          showToast({ message: "Materia eliminada correctamente.", type: "success" });
          await fetchMateriasAsignadas(alumnoSeleccionado._id);
        } catch {
          showToast({ message: "Error al eliminar materia.", type: "error" });
        }
      },
    });
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
      showToast({ message: res.data?.error || "Error al asignar nota.", type: "error" });
      return;
    }

    showToast({ message: "Nota asignada correctamente.", type: "success" });
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
      showToast({ message: res.data?.error || "Error al asignar nota.", type: "error" });
      return;
    }

    showToast({ message: "Nota guardada correctamente.", type: "success" });
    setShowNotaModal(false);
    setCursoParaNota(null);
    await fetchCursosByAlumnoId(alumnoSeleccionado._id);
  };

  return (
    <div className="max-w-4xl mx-auto ">
      <PageTitle>Asignar Equivalencias</PageTitle>
      <ConfirmModal
        open={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmModal?.onConfirm}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmColor={confirmModal?.confirmColor}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="h-full flex flex-col justify-between p-6">
          <form onSubmit={buscarAlumnoPorDni} className="flex flex-col items-center gap-4 h-full justify-center">
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

        <Card className="h-full flex flex-col justify-between p-6">
          <div className="flex flex-col items-center gap-4 h-full justify-center">
            <p className="text-sm font-bold self-start">
              {alumnoSeleccionado
                ? `${alumnoSeleccionado.lastname} ${alumnoSeleccionado.name} - DNI: ${alumnoSeleccionado.dni}`
                : "No seleccionado"}
            </p>

            <Select className="w-full" value={materiaSeleccionada} onChange={(e) => setMateriaSeleccionada(e.target.value)}>
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
                <Accordion.Title className="text-blue-800 dark:text-blue-200">Cursos asignados</Accordion.Title>
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
              <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Cursos asignados</h3>
              <p className="text-blue-700/70 dark:text-blue-300/70">No tiene cursos asignados.</p>
            </>
          )}
        </Card>
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
