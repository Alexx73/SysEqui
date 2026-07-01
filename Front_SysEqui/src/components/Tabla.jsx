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
}) {
  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          {columnas.map((col, index) => (
            <Table.HeadCell key={`head-${col.clave || index}`}>{col.titulo}</Table.HeadCell>
          ))}
{(mostrarIconoEditar ||
            mostrarIconoEliminar ||
            mostrarLinks ||
            mostrarIconoActivo ||
            linkMateria ||
            mostrarIconoAprobar) && <Table.HeadCell key="acciones-head">Acciones</Table.HeadCell>}
        </Table.Head>

        <Table.Body className="divide-y [&>*]:py-">
          {datos.map((fila, filaIndex) => (
            <Table.Row key={fila._id || fila.id || filaIndex}>
              {columnas.map((col, colIndex) => (
                <Table.Cell
                  className="px-5 py-1 text-sm cursor-pointer"
                  onDoubleClick={() => onDobleClickFila?.(fila)}
                  key={`cell-${fila._id || fila.id || filaIndex}-${col.clave || colIndex}`}>
                  {col.render ? col.render(fila[col.clave], fila, filaIndex) : fila[col.clave]}
                </Table.Cell>
              ))}

{(mostrarIconoEditar ||
            mostrarIconoEliminar ||
            mostrarLinks ||
            mostrarIconoActivo ||
            linkMateria ||
            mostrarIconoAprobar) && (
                <Table.Cell
                  key={`acciones-${fila._id || fila.id || filaIndex}`}
                  className="flex gap-1 flex-wrap items-center">
                  {mostrarIconoEditar && (
                    <button
                      onClick={() => onEditar?.(fila)}
                      className="bg-yellow-400 text-white p-1 rounded"
                      title="Editar">
                      <HiPencil className="w-5 h-5" />
                    </button>
                  )}

                  {mostrarIconoEliminar && (
                    <button
                      onClick={() => onEliminar?.(fila)}
                      className="bg-red-500 text-white p-1 rounded"
                      title="Eliminar">
                      <HiTrash className="w-5 h-5" />
                    </button>
                  )}

                  {mostrarIconoAprobar && (
                    <button
                      onClick={() => onAprobar?.(fila)}
                      className="bg-green-500 text-white p-1 rounded"
                      title="Aprobar">
                      <HiCheck className="w-5 h-5" />
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
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
