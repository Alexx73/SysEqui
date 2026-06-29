import React, { useEffect, useState } from "react";
import TablaReutilizable from "../components/Tabla";
import { Modal, Button, Tooltip, Card } from "flowbite-react";
import ListaSeleccionable from "../components/ListaSeleccionable";
import { CursosAPI } from "../api/CursosAPI";
import { useMaterias } from "../utils/useMaterias";
import { useAlumnosProfesores } from "../utils/useAlumnosProfesores";
import { useCursos } from "../utils/useCursos";

export default function AdministrarCursos() {
  const { alumnos, profesores, getAlumnosYProfesores } = useAlumnosProfesores();
  const { cursos, getCursos, setCursos } = useCursos();
  const { materias, fetchMaterias } = useMaterias();

  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selecciones, setSelecciones] = useState({
    alumnos: [],
    docentesEncargados: [],
  });

  useEffect(() => {
    const cargarDatos = async () => {
      const materiasCargadas = await fetchMaterias();
      const { alumnos, profesores } = await getAlumnosYProfesores();
      await getCursos(materiasCargadas, alumnos, profesores);
    };
    cargarDatos();
  }, []);

  // Tooltip personalizado
  const customTooltipTheme = {
    style: {
      base: "z-50 inline-block rounded-lg border-2 border-green-500 bg-white p-4 text-sm text-gray-900 shadow-xl",
    },
  };

  // Guardar cambios
  const guardarCambios = async () => {
    try {
      const cursoParaEnviar = { ...cursoSeleccionado };
      delete cursoParaEnviar.materia;

      await CursosAPI.modifyCursoById(cursoParaEnviar._id, cursoParaEnviar);

      setShowSuccessModal(true);
      setCursoSeleccionado(null);

      // 🧠 Asegurarse que obtenés materias, alumnos y profesores actualizados
      const nuevasMaterias = await fetchMaterias();
      const { alumnos: nuevosAlumnos, profesores: nuevosProfes } = await getAlumnosYProfesores();

      // 🧠 Llamás con los nuevos datos
      await getCursos(nuevasMaterias, nuevosAlumnos, nuevosProfes);
    } catch (error) {
      alert("Error al guardar los cambios.");
    }

    setTimeout(() => setShowSuccessModal(false), 1500);
  };

  // Editar curso
  const handleEditar = async (curso) => {
    await fetchMaterias();
    const formatearFecha = (fecha) => {
      if (!fecha) return "";
      const d = new Date(fecha);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    setCursoSeleccionado({
      ...curso,
      fechaInicio: formatearFecha(curso.fechaInicio),
      fechaEstimadaFin: formatearFecha(curso.fechaEstimadaFin),
      docentesEncargados: curso.docentesEncargados || [],
    });
    setSelecciones({
      alumnos: [],
      docentesEncargados: [],
    });
  };

  // Agregar items a lista
  const agregarItemsLista = (tipo, items) => {
    const existentes = Array.isArray(cursoSeleccionado[tipo]) ? cursoSeleccionado[tipo] : [];
    const nuevos = items
      .filter((i) => !existentes.some((e) => e.dni === i.dni))
      .map((i) => ({
        ...i,
        name: i.name || i.nombre,
        lastname: i.lastname || i.apellido,
      }));
    if (nuevos.length === 0) {
      alert(`Todos los ${tipo} seleccionados ya están en la lista.`);
      return;
    }
    setCursoSeleccionado((prev) => ({
      ...prev,
      [tipo]: [...existentes, ...nuevos],
    }));
    setSelecciones((prev) => ({ ...prev, [tipo]: [] }));
  };

  // Borrar items de lista
  const borrarItemsLista = (tipo, items) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar los seleccionados?")) return;
    setCursoSeleccionado((prev) => ({
      ...prev,
      [tipo]: prev[tipo].filter((el) => !items.some((sel) => sel.dni === el.dni)),
    }));
    setSelecciones((prev) => ({ ...prev, [tipo]: [] }));
  };

  // Renderizar lista seleccionable
  const renderLista = (tipo, color, datos) => {
    const lista = Array.isArray(cursoSeleccionado?.[tipo]) ? cursoSeleccionado[tipo] : [];
    return (
      <ListaSeleccionable
        titulo={tipo === "alumnos" ? "Alumnos" : "Profesores"}
        elementos={lista}
        seleccionados={selecciones[tipo]}
        setSeleccionados={(items) => setSelecciones((prev) => ({ ...prev, [tipo]: items }))}
        tipo={tipo}
        color={color}
        addSelect={true}
        datosSelect={datos}
        agregarItems={(tipo, items) => agregarItemsLista(tipo, items)}
        borrarItems={borrarItemsLista}
      />
    );
  };

  // Validación de cambios
  const tieneCambios =
    cursoSeleccionado &&
    cursoSeleccionado.alumnos?.length > 0 &&
    cursoSeleccionado.docentesEncargados?.length > 0;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center">Administrar Cursos</h2>
      <TablaReutilizable
        datos={cursos}
        columnas={[
          { clave: "materia", titulo: "Curso" },
          {
            clave: "fechaInicio",
            titulo: "Fecha de Inicio",
            render: (valor) => {
              const fecha = new Date(valor);
              return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
            },
          },
          {
            clave: "fechaEstimadaFin",
            titulo: "Fecha Fin",
            render: (valor) => {
              const fecha = new Date(valor);
              return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
            },
          },
          { clave: "shift", titulo: "turno" },
          {
            clave: "docentesEncargados",
            titulo: "Profesores",
            render: (_, fila) => {
              const listaProfes = Array.isArray(fila.docentesEncargados) ? fila.docentesEncargados : [];
              return (
                <Tooltip
                  theme={customTooltipTheme}
                  content={
                    <div
                      className="text-sm text-left max-w-sm max-h-52 overflow-y-auto cursor-pointer"
                      onClick={() => handleEditar(fila)}>
                      <table className="table-auto w-full text-left border-separate border-spacing-y-1">
                        <tbody>
                          {listaProfes
                            .sort((a, b) => {
                              const aLast = (a.lastname || a.apellido || "").toString();
                              const bLast = (b.lastname || b.apellido || "").toString();
                              const aName = (a.name || a.nombre || "").toString();
                              const bName = (b.name || b.nombre || "").toString();
                              return aLast.localeCompare(bLast) || aName.localeCompare(bName);
                            })
                            .map((p, i) => (
                              <tr key={i} className="border-b">
                                <td className="pr-4 font-medium">{i + 1}.</td>
                                <td className="pr-4">
                                  {p.lastname} {p.name}
                                </td>
                                <td>{p.dni}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  }>
                  <span className="cursor-help underline decoration-dotted">
                    {listaProfes.length > 1
                      ? `${listaProfes[0]?.lastname || ""} ${listaProfes[0]?.name || ""}  +`
                      : `${listaProfes[0]?.lastname || ""} ${listaProfes[0]?.name || ""}`}
                  </span>
                </Tooltip>
              );
            },
          },
          {
            clave: "alumnos",
            titulo: "Alumnos",
            render: (_, fila) => {
              const listaAlumnos = Array.isArray(fila.alumnos) ? fila.alumnos : [];
              return (
                <Tooltip
                  theme={customTooltipTheme}
                  content={
                    <div
                      className="text-sm text-left max-w-sm max-h-52 overflow-y-auto cursor-pointer"
                      onClick={() => handleEditar(fila)}>
                      <table className="table-auto w-full text-left border-separate border-spacing-y-1">
                        <tbody>
                          {listaAlumnos
                            .sort((a, b) => {
                              const aLast = (a.lastname || a.apellido || "").toString();
                              const bLast = (b.lastname || b.apellido || "").toString();
                              const aName = (a.name || a.nombre || "").toString();
                              const bName = (b.name || b.nombre || "").toString();
                              return aLast.localeCompare(bLast) || aName.localeCompare(bName);
                            })
                            .map((a, i) => (
                              <tr key={i} className="border-b">
                                <td className="pr-4 font-medium">{i + 1}.</td>
                                <td className="pr-4">
                                  {a.lastname} {a.name}
                                </td>
                                <td>{a.dni}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  }>
                  <span className="cursor-help underline decoration-dotted">
                    {listaAlumnos.length > 1
                      ? `${listaAlumnos[0]?.lastname || ""} ${listaAlumnos[0]?.name || ""}  +`
                      : `${listaAlumnos[0]?.lastname || ""} ${listaAlumnos[0]?.name || ""}`}
                  </span>
                </Tooltip>
              );
            },
          },
        ]}
        mostrarIconoEditar={true}
        onEditar={handleEditar}
        mostrarIconoEliminar={true}
        onEliminar={(curso) => console.log("Eliminar curso:", curso)}
        mostrarLinks={false}
      />

      {/* Modal de edición */}
      <Modal
        show={!!cursoSeleccionado && materias.length > 0}
        onClose={() => setCursoSeleccionado(null)}
        theme={{
          root: {
            base: "fixed top-0 left-0 right-0 z-50 flex justify-center items-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full",
            show: { on: "flex", off: "hidden" },
            sizes: { sm: "", md: "max-w-7xl", lg: "max-w-7xl", xl: "max-w-7xl", "2xl": "max-w-7xl" },
          },
        }}
        className="max-w-5xl w-[90vw]">
        <Modal.Header>
          <div>Editar Curso: {cursoSeleccionado?.materia || ""}</div>
        </Modal.Header>
        <Modal.Body>
          <div>
            {cursoSeleccionado && (
              <div className="space-y-2">
                <Card className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold">Materia:</label>
                      {materias.length > 0 ? (
                        <select
                          className="w-full p-2 border rounded"
                          value={cursoSeleccionado.materia || ""}
                          onChange={(e) => {
                            const materiaSeleccionada = materias.find((mat) => mat.name === e.target.value);
                            setCursoSeleccionado({
                              ...cursoSeleccionado,
                              materia: materiaSeleccionada?.name || "",
                              idMateria: materiaSeleccionada?._id || "",
                            });
                          }}>
                          <option value="" disabled>
                            Seleccione una materia
                          </option>
                          {materias.map((mat) => (
                            <option key={mat._id} value={mat.name}>
                              {mat.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-500">Cargando materias...</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-semibold">Turno:</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={cursoSeleccionado.shift}
                        onChange={(e) =>
                          setCursoSeleccionado({ ...cursoSeleccionado, shift: e.target.value })
                        }>
                        <option value="diurno">Diurno</option>
                        <option value="nocturno">Nocturno</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">Fecha de Inicio:</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={cursoSeleccionado.fechaInicio}
                        onChange={(e) =>
                          setCursoSeleccionado({ ...cursoSeleccionado, fechaInicio: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Fecha de Fin:</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={cursoSeleccionado.fechaEstimadaFin}
                        onChange={(e) =>
                          setCursoSeleccionado({ ...cursoSeleccionado, fechaEstimadaFin: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>{renderLista("docentesEncargados", "bg-green-300", profesores)}</div>
                  <div>{renderLista("alumnos", "bg-yellow-300", alumnos)}</div>
                </div>
                <div className="flex justify-center gap-20 mt-4">
                  <Button className="w-40" color="success" onClick={guardarCambios} disabled={!tieneCambios}>
                    Enviar Cambios
                  </Button>
                  <Button className="w-40" color="warning" onClick={() => setCursoSeleccionado(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de éxito */}
      <Modal show={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <Modal.Header>✅ Curso Actualizado</Modal.Header>
        <Modal.Body>
          <p className="text-green-700">Los cambios fueron guardados correctamente.</p>
        </Modal.Body>
      </Modal>

      {/* Mensaje de error por lista seleccionable vacía */}
      {cursoSeleccionado &&
        (cursoSeleccionado.alumnos.length === 0 || cursoSeleccionado.docentesEncargados.length === 0) && (
          <div className="text-center text-red-600 font-medium">
            ⚠️ La lista de alumnos y profesores no puede estar vacía.
          </div>
        )}
    </div>
  );
}
