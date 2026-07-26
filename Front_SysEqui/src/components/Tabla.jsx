import { Table, ToggleSwitch, Tooltip } from "flowbite-react";
import { HiPencil, HiTrash, HiCheck } from "react-icons/hi";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { RiCheckLine, RiCloseLine } from "react-icons/ri";
// import { HiCheck } from "react-icons/hi";

export default function TablaReutilizable({
  datos = [],
  columnas = [],
  onEditar,
  onEliminar,
  onAprobar,
  mostrarIconoEditar = false,
  mostrarIconoEliminar = false,
  mostrarIconoAprobar = false,
  mostrarIconos = false,
  mostrarLinks = false,
  linkAlumno,
  linkMateria = false,
  LinkTexto = "Ver",
  link1 = null,
  mostrarIconoActivo = false,
  unIcono,
  onToggle,
  onLinkClick, // 👈 AÑADIR ESTA LÍNEA
  onDobleClickFila,
  sortConfig,
  onSort,
  accionesAdicionales = [],
  compactaEnMovil = false,
}) {
  const tieneAcciones =
    mostrarIconoEditar ||
    mostrarIconoEliminar ||
    mostrarLinks ||
    mostrarIconoActivo ||
    linkMateria ||
    mostrarIconoAprobar ||
    accionesAdicionales.length > 0;
  const claseResponsiveColumna = (columna) => {
    if (columna.soloMovil) return "table-cell md:hidden";
    if (columna.ocultarEnMovil) return "hidden md:table-cell";
    return "";
  };
  const claseIcono = compactaEnMovil ? "h-4 w-4 md:h-5 md:w-5" : "h-5 w-5";

  return (
    <div className={compactaEnMovil ? "w-full overflow-hidden md:overflow-x-auto" : "overflow-x-auto"}>
      <Table hoverable className={compactaEnMovil ? "w-full table-fixed md:table-auto" : ""}>
        <Table.Head>
          {columnas.map((col, index) => {
            const isSortable = Boolean(col.sortable && onSort);
            const isSorted = sortConfig?.key === col.clave;
            const sortIndicator = isSorted ? (sortConfig.direction === "asc" ? "▲" : "▼") : "";

            return (
              <Table.HeadCell
                key={`head-${col.clave || index}`}
                className={`${claseResponsiveColumna(col)} ${col.claseMovil || ""} ${
                  compactaEnMovil ? "px-1 py-2 text-[10px] md:px-6 md:py-3 md:text-xs" : ""
                }`}>
                {isSortable ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.clave)}
                    className="inline-flex cursor-pointer items-center gap-1 bg-transparent p-0 text-left font-semibold uppercase tracking-normal hover:text-blue-300 focus:outline-none">
                    <span>{col.titulo}</span>
                    <span className="inline-block w-3 text-blue-300 leading-none">{sortIndicator}</span>
                  </button>
                ) : (
                  col.titulo
                )}
              </Table.HeadCell>
            );
          })}
          {tieneAcciones && (
            <Table.HeadCell
              key="acciones-head"
              className={compactaEnMovil ? "w-[14%] px-1 py-2 text-[10px] md:w-auto md:px-6 md:py-3 md:text-xs" : ""}>
              <span className={compactaEnMovil ? "md:hidden" : "hidden"}>Acc.</span>
              <span className={compactaEnMovil ? "hidden md:inline" : ""}>Acciones</span>
            </Table.HeadCell>
          )}
        </Table.Head>

        <Table.Body className="divide-y [&>*]:py-">
          {datos.map((fila, filaIndex) => (
            <Table.Row key={fila._id || fila.id || filaIndex}>
              {columnas.map((col, colIndex) => (
                <Table.Cell
                  className={`${claseResponsiveColumna(col)} ${col.claseMovil || ""} cursor-pointer ${
                    compactaEnMovil
                      ? "break-words px-1 py-2 text-xs leading-tight md:px-5 md:py-1 md:text-sm"
                      : "px-5 py-1 text-sm"
                  }`}
                  onDoubleClick={() => onDobleClickFila?.(fila)}
                  key={`cell-${fila._id || fila.id || filaIndex}-${col.clave || colIndex}`}>
                  {col.render ? col.render(fila[col.clave], fila, filaIndex) : fila[col.clave]}
                </Table.Cell>
              ))}

{tieneAcciones && (
                <Table.Cell
                  key={`acciones-${fila._id || fila.id || filaIndex}`}
                  className={`whitespace-nowrap ${compactaEnMovil ? "px-1 py-2 md:px-6 md:py-4" : ""}`}>
                  <div
                    className={`flex flex-nowrap items-center ${
                      compactaEnMovil ? "justify-center gap-0.5 md:gap-1" : "gap-1"
                    }`}>
                  {mostrarIconoEditar && (
                    <button
                      onClick={() => onEditar?.(fila)}
                      className={`rounded bg-yellow-400 text-white ${compactaEnMovil ? "p-0.5 md:p-1" : "p-1"}`}
                      title="Editar">
                      <HiPencil className={claseIcono} />
                    </button>
                  )}

                  {mostrarIconoEliminar && (
                    <button
                      onClick={() => onEliminar?.(fila)}
                      className={`rounded bg-red-500 text-white ${compactaEnMovil ? "p-0.5 md:p-1" : "p-1"}`}
                      title="Eliminar">
                      <HiTrash className={claseIcono} />
                    </button>
                  )}

                  {mostrarIconoAprobar && (
                    <button
                      onClick={() => onAprobar?.(fila)}
                      className={`rounded bg-green-500 text-white ${compactaEnMovil ? "p-0.5 md:p-1" : "p-1"}`}
                      title="Aprobar">
                      <HiCheck className={claseIcono} />
                    </button>
                  )}

                  {mostrarLinks && (
                    <Link
                      to={`/materiasaprobadas/${fila._id || fila.id}`}
                      state={{ alumno: fila }}
                      className="bg-green-600 text-white text-sm px-2 py-1 rounded">
                      {LinkTexto}
                    </Link>
                  )}

                  {linkMateria && (
                    <button
                      onClick={() => onLinkClick?.(fila)}
                      className="bg-blue-600 text-white text-sm px-2 py-1 rounded">
                      {LinkTexto}
                    </button>
                  )}
                  {accionesAdicionales.map((accion, index) => {
                    if (accion.visible && !accion.visible(fila)) return null;
                    const Icono = accion.icono;
                    return (
                      <button
                        key={`${accion.label || "accion"}-${index}`}
                        type="button"
                        onClick={() => accion.onClick?.(fila)}
                        className={accion.className || "rounded bg-blue-600 p-1 text-white"}
                        title={accion.label}
                        aria-label={`${accion.label}${fila.name ? ` de ${fila.name} ${fila.lastname || ""}` : ""}`}>
                        {Icono ? <Icono className="h-5 w-5" /> : accion.label}
                      </button>
                    );
                  })}
                  </div>
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
