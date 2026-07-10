import React, { useEffect, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { MateriasAPI } from "../api/MateriasAPI";

// import { HiTrash } from "react-icons/hi";
import ListaSeleccionable from "./ListaSeleccionable";

import { Toast } from "flowbite-react";
import { HiCheck, HiTrash } from "react-icons/hi";
import { Button, Card } from "flowbite-react";
import { CursosAPI } from "../api/CursosAPI";
import { useAlumnosProfesores } from "../utils/useAlumnosProfesores";
import { PendientesAPI } from "../api/Pendientes";

export default function CrearCursoFormModal({ embedded = false, onCursoCreado, onClose } = {}) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosFormulario, setDatosFormulario] = useState(null);

  const [loading, setLoading] = useState(false);
  const [materias, setMaterias] = useState([]);

  const { alumnos, profesores, getAlumnosYProfesores } = useAlumnosProfesores();

  // Profesores activos
  const profesoresActivos = profesores.filter((p) => p.isActive === true && p.role === "professor");

  // Estado para el toast de confirmación
  const [showToast, setShowToast] = useState(false);
  const [materiaActualizada, setMateriaActualizada] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [materiaToHandle, setMateriaToHandle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    oneButton: true,
  });

  const [alumnosConPendientes, setAlumnosConPendientes] = useState([]);

  const preceptores = ["Preceptor A", "Preceptor B"];

  const [curso, setCurso] = useState({
    materia: "",
    idMateria: "",
    docentesEncargados: [],
    alumnos: [],
    fechaInicio: new Date().toISOString().split("T")[0], // hoy
    fechaEstimadaFin: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0], // +1 mes
    shift: "diurno",
  });

  const [seleccionados, setSeleccionados] = useState({
    profesores: [],
    // preceptores: [],
    alumnos: [],
  });

  const cursoValido = curso.materia && curso.shift;
  // curso.materia && curso.shift && (curso.docentesEncargados.length > 0 || curso.alumnos.length) > 0;

  // Agregar a la lista
  const agregar = (tipoLista, item) => {
    const yaExiste = curso[tipoLista].some((i) => JSON.stringify(i) === JSON.stringify(item));

    if (yaExiste) {
      setModalContent({
        title: "Atención",
        message: `El ${tipoLista.slice(0, -1)} ${item[0]} ya fue agregado.`,
        oneButton: true,
      });
      setModalOpen(true);
      return;
    }

    setCurso((prev) => ({
      ...prev,
      [tipoLista]: [...prev[tipoLista], item],
    }));

    setSeleccionados((prev) => ({ ...prev, [tipoLista.slice(0, -1)]: [] }));
  };

  // Eliminar del resumen
  const eliminar = (tipoLista, item) => {
    setCurso((prev) => ({
      ...prev,
      [tipoLista]: prev[tipoLista].filter((i) => i !== item),
    }));
  };
  // Confirmar curso
  const confirmarCurso = async () => {
    const cursoAEnviar = { ...curso };
    delete cursoAEnviar.materia; // ⛔ Eliminar campo solo del envío
    // alert("Curso enviado. Ver consola.");
    try {
      const res = await CursosAPI.createCurso(cursoAEnviar);
      alert("Curso creado con éxito");

      // Resetear estado
      setCurso({
        materia: "", // Solo uso local
        idMateria: "",
        shift: "diurno",
        docentesEncargados: [],
        alumnos: [],
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaEstimadaFin: new Date(new Date().setMonth(new Date().getMonth() + 1))
          .toISOString()
          .split("T")[0],
      });
      setSeleccionados({
        profesores: [],
        preceptores: [],
        alumnos: [],
      });
      await onCursoCreado?.();
      onClose?.();
    } catch (error) {
      console.error("❌ Error al crear el curso:", error);
      alert("Error al crear el curso. Ver consola.");
    }
  };

  const handleEditar = (materia) => {
    setDatosFormulario({
      name: materia.name,
      year: materia.year,
      shift: materia.shift,
      _id: materia._id, // guardamos id para actualizar después
    });
    setModoEdicion(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (modoEdicion && datosFormulario?._id) {
        // Actualizar materia
        const response = await MateriasAPI.modifyMateriaById(datosFormulario._id, data);
        setMateriaActualizada(true);
        alert("✏️ Materia actualizada", response.data.message);
      } else {
        // Crear materia nueva
        const response = await MateriasAPI.createMateria(data);
      }

      await getMaterias();
      setModalOpen(true);
      setModoEdicion(false);
      setDatosFormulario(null); // limpiar formulario
    } catch (error) {
      setModalContent({
        title: "Error",
        message: `❌ No se pudo ${modoEdicion ? "actualizar" : "crear"} el curso.\n${error.message}`,
        oneButton: true,
      });
      setModalOpen(true);
      console.error("Error al guardar el curso:", error);
    }
  };

  // ✅ Método para eliminar materia
  const handleEliminar = async (materia) => {
    const confirm = window.confirm(`¿Eliminar la materia ${materia.name} ${materia._id}?`);
    if (!confirm) return;

    try {
      await MateriasAPI.deleteMateriaById(materia._id);
      alert("🗑️ Materia eliminada");
      getMaterias();
    } catch (error) {
      alert("❌ Error al eliminar");
    }
  };

  const handleToggleActive = (materia) => {
    setMateriaToHandle(materia);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!materiaToHandle) return;

    try {
      setLoading(true);

      if (materiaToHandle.active) {
        await MateriasAPI.deleteMateriaById(materiaToHandle._id);
        triggerToast();
      } else {
        await MateriasAPI.modifyMateria(materiaToHandle._id);
        triggerToast();
      }
    } catch (error) {
      alert(`❌ Error al cambiar el estado de la materia ${error.message}`);
      alert("Error:", error);
    } finally {
      getMaterias();
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000); // 2 segundos
  };

  //   / 🔁 Obtener materias al cargar
  const getMaterias = async () => {
    try {
      const res = await MateriasAPI.getMateriasAll();
      const data = Array.isArray(res.data.equivalencias) ? res.data.equivalencias : [];
      setMaterias(data);
    } catch (error) {
      alert("❌ Error al obtener materias:", error);
    }
  };

  useEffect(() => {
    getMaterias(); // cargar al montar
  }, []);

  //buscar aalumnos con la materia seleccionada
  const buscarAlumnos = async () => {
    if (!curso.idMateria) {
      alert("Por favor, seleccione una materia.");
      return;
    }

    try {
      const res = await PendientesAPI.getPendientesAll();
      const equivalencias = res.data.equivalencias || [];

      const materiaSeleccionada = materias.find((m) => m._id === curso.idMateria);
      if (!materiaSeleccionada) {
        alert("Materia no encontrada.");
        return;
      }

      const alumnosPendientes = equivalencias.filter(
        (p) =>
          p.name.trim().toLowerCase() === materiaSeleccionada.name.trim().toLowerCase() &&
          p.year === materiaSeleccionada.year,
      );

      if (alumnosPendientes.length === 0) {
        alert("No se encontraron alumnos para esta materia.");
        return;
      } else {
        const alumnosConPendientes = alumnos.filter((a) => alumnosPendientes.some((p) => p.userId === a._id));

        setAlumnosConPendientes(alumnosConPendientes);
      }
    } catch (error) {
      console.error("Error al buscar alumnos:", error);
      alert("Error al buscar alumnos. Ver consola.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-1">
      {!embedded && <h2 className="text-2xl font-bold mb-2 text-center">Crear Nuevo Curso</h2>}

      {/* Select */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="w-full">
          <label className="block font-semibold mb-1">Materia:</label>
          <select
            value={curso.idMateria}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedMateria = materias.find((mat) => mat._id === selectedId);
              // Limpiar la lista de alumnos con pendientes al cambiar de materia
              setAlumnosConPendientes([]);
              setCurso((prev) => ({
                ...prev,
                materia: selectedMateria?.name || "",
                idMateria: selectedId,
              }));
            }}
            className="w-full p-2 border rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white">
            <option value="">Seleccione una materia</option>
            {/* ordenar materias por año y luego alfabeticamente */}
            {materias
              .sort((a, b) => {
                // Primero compara por año
                if (a.year !== b.year) {
                  return a.year - b.year; // orden ascendente por año
                }
                // Si el año es igual, compara por nombre (alfabéticamente)
                return a.name.localeCompare(b.name);
              })
              .map((mat) => (
                <option key={mat._id} value={mat._id}>
                  {mat.name + " - " + mat.year}
                </option>
              ))}
          </select>
          {/* <button onClick={buscarAlumnos} className="bg-blue-400">
            Buscar Alumnos
          </button> */}
          <Button
            className="text-white"
            size="sm"
            // disabled={seleccionadosValidos.length === 0}
            onClick={buscarAlumnos}>
            Buscar Alumnos
          </Button>
        </Card>

        <Card>
          <label className="block font-semibold mb-1">Turno:</label>
          <select
            value={curso.shift}
            onChange={(e) => setCurso((prev) => ({ ...prev, shift: e.target.value }))}
            className="w-full p-2 border rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white">
            <option value="diurno">Diurno</option>
            <option value="nocturno">Nocturno</option>
          </select>
        </Card>

        <Card className="w-full">
          <label className="block font-semibold mb-1">Fecha de Inicio:</label>
          <input
            type="date"
            className="w-full p-2 border rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white"
            value={curso.fechaInicio || ""}
            max={new Date().toISOString().split("T")[0]} // hoy
            min={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]} // hace 1 mes
            onChange={(e) => setCurso((prev) => ({ ...prev, fechaInicio: e.target.value }))}
            required
          />
        </Card>
        <Card className="w-full">
          <label className="block font-semibold mb-1">Fecha de Fin:</label>
          <input
            type="date"
            className="w-full p-2 border rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white"
            value={curso.fechaEstimadaFin || ""}
            min={new Date().toISOString().split("T")[0]} // hoy
            onChange={(e) => setCurso((prev) => ({ ...prev, fechaEstimadaFin: e.target.value }))}
            required
          />
        </Card>
      </div>

      {/* Profesores y Alumnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
      <ListaSeleccionable
          titulo="Profesores"
          elementos={profesoresActivos}
          addSelect={true}
          seleccionados={seleccionados.profesores}
          setSeleccionados={(nuevos) => setSeleccionados((prev) => ({ ...prev, profesores: nuevos }))}
          tipo="docentesEncargados"
          color="bg-blue-300"
          agregarItems={(tipo, items) => items.forEach((item) => agregar(tipo, item))}
        />
        {/* Alumnos */}
        <ListaSeleccionable
          titulo="Alumnos2"
          elementos={alumnosConPendientes}
          seleccionados={seleccionados.alumnos}
          addSelect={true}
          setSeleccionados={(nuevos) => setSeleccionados((prev) => ({ ...prev, alumnos: nuevos }))}
          tipo="alumnos"
          color="bg-yellow-300"
          agregarItems={(tipo, items) => items.forEach((item) => agregar(tipo, item))}
        />
       
      </div>

      <div>
        {/*Resumen del Curso creado */}
        <Card className="md:col-span-3">
          <h5 className="font-bold text-md ">Crear Curso</h5>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_2fr] gap-4 mb-1">
            <div>
              <div>
                <p className="text-sm text-gray-400">Materia:</p>
                <p className="font-semibold">{curso.materia || "No seleccionada"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 ">Turno:</p>
                <p className="font-semibold capitalize mb-2">{curso.shift}</p>
              </div>
              {/* Fecha */}
              <div className="">
                <div>
                  <p className="text-sm text-gray-400">Fecha de Inicio:</p>
                  <p className="font-semibold">{curso.fechaInicio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fecha de Fin:</p>
                  <p className="font-semibold">{curso.fechaEstimadaFin}</p>
                </div>
              </div>
            </div>

            <div>
              {/* Profesores */}
              <div>
                <h5 className="font-semibold  mb-1 ">Profesores:</h5>
                <div className="grid grid-cols-2 font-bold text-sm mb-1">
                  <div>Nombre</div>
                  <div>DNI</div>
                </div>
                <ul className="space-y-1">
                  {curso.docentesEncargados.map((prof, index) => (
                    <li
                      key={prof.dni || index}
                      className="grid grid-cols-2 items-center bg-gray-500 px-2 py-1 rounded">
                      <div>{prof.lastname + " " + prof.name}</div>
                      <div className="flex justify-between">
                        <span>{prof.dni}</span>
                        <Button
                          color="failure"
                          size="xs"
                          onClick={() => eliminar("docentesEncargados", prof)}>
                          <HiTrash className="cursor-pointer hover:text-red-800 text-lg" title="Quitar" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              {/* Alumnos */}
              <div>
                <h4 className="font-semibold mb-1">Alumnos:</h4>
                <div className="grid grid-cols-2 font-bold text-sm mb-1">
                  <div>Nombre</div>
                  <div>Dni</div>
                </div>
                <ul className="space-y-1">
                  {curso.alumnos.map((alum) => (
                    <li
                      key={alum.dni || index}
                      className="grid grid-cols-2 items-center bg-gray-600 px-2 py-1 rounded">
                      <div>{alum.lastname + " " + alum.name}</div>
                      <div className="flex justify-between">
                        <span>{alum.dni}</span>
                        <Button color="failure" size="xs" onClick={() => eliminar("alumnos", alum)}>
                          <HiTrash className="cursor-pointer hover:text-red-800 text-lg" title="Quitar" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4"></div>

          <div className=" text-center">
            <Button
              color="success"
              className="w-1/2 mx-auto"
              onClick={confirmarCurso}
              disabled={!cursoValido}>
              Confirmar curso
            </Button>
          </div>
        </Card>
      </div>
      {/* // En el return del componente principal */}

      <ConfirmModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={`¿${materiaToHandle?.active ? "Desactivar" : "Activar"} materia?`}
        message={`¿Cambiar el estado de ${materiaToHandle?.name} (ID: ${materiaToHandle?._id})?`}
        oneButton={false}
      />

      {showToast && (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast className="p-8 gap-4 shadow-xl max-w-md">
            {materiaToHandle?.active ? (
              // Estado activo (desactivación)
              <>
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                  <HiTrash className="h-5 w-5" />
                </div>
                <div className="ml-4 text-base font-semibold text-gray-800 dark:text-white">
                  Materia {materiaToHandle.name} desactivada .
                </div>
              </>
            ) : (
              // Estado inactivo (activación)
              <>
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                  <HiCheck className="h-5 w-5" />
                </div>
                <div className="ml-4 text-base font-semibold text-gray-800 dark:text-white">
                  Materia {materiaToHandle?.name} activada .
                </div>
              </>
            )}
            {}
          </Toast>
        </div>
      )}
    </div>
  );
}
