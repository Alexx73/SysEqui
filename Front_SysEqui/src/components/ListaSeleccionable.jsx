import React, { useState } from "react";
import { Button, Card, Dropdown } from "flowbite-react";
// import Select from "react-select";

export default function ListaSeleccionable({
  titulo,
  elementos,
  seleccionados,
  addSelect = false,
  datosSelect = [],
  setSeleccionados,
  tipo,
  color = "bg-blue-300",
  agregarItems,
  borrarItems,
}) {
  // Asegurar que seleccionados sea siempre un array
  const seleccionadosValidos = Array.isArray(seleccionados) ? seleccionados : [];
  const [hasInteracted, setHasInteracted] = useState(false);

  // const alternarSeleccion = (item) => {
  //   const yaSeleccionado = seleccionadosValidos.some((el) => el[1] === item[1]);
  //   if (yaSeleccionado) {
  //     setSeleccionados(seleccionadosValidos.filter((el) => el[1] !== item[1]));
  //   } else {
  //     setSeleccionados([...seleccionadosValidos, item]);
  //   }
  // };

  const alternarSeleccion = (item) => {
    const yaSeleccionado = seleccionadosValidos.some((el) => el.dni === item.dni);
    if (yaSeleccionado) {
      setSeleccionados(seleccionadosValidos.filter((el) => el.dni !== item.dni));
    } else {
      setSeleccionados([...seleccionadosValidos, item]);
    }
  };

  return (
    <Card className="w-full mt-4">
      <h3 className="font-bold mb-2">{titulo}</h3>

      {addSelect && (
        <div className="relative inline-block text-left w-full">
          <div className="flex items-center justify-between">
            <Dropdown placement="top" label={`Seleccionar ${titulo}`} color="gray" dismissOnClick={false}>
              <div className="grid grid-cols-[2fr_1fr] gap-x-4 px-4 py-2 text-sm text-gray-900 dark:text-white">
                <div className="font-bold text-left">Nombre</div>
                <div className="font-bold text-left">DNI</div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {datosSelect.map((el) => {
                  const estaSeleccionado = seleccionados.some((s) => s.dni === el.dni);

                  return (
                    <Dropdown.Item
                      key={el.dni}
                      onClick={() => {
                        setHasInteracted(true); // ahora se empieza a resaltar
                        alternarSeleccion(el);
                      }}
                      className={`grid grid-cols-[2fr_1fr] gap-x-4 text-sm px-4 py-2 cursor-pointer
      ${
        hasInteracted && seleccionados.some((s) => s.dni === el.dni)
          ? "bg-blue-100 dark:bg-blue-700 font-semibold"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }
    `}>
                      <span className="text-left">{`${el.lastname}, ${el.name}`}</span>
                      <span className="text-right">{el.dni}</span>
                    </Dropdown.Item>
                  );
                })}
              </div>
            </Dropdown>
            <Button
              className="text-white"
              size="sm"
              disabled={seleccionadosValidos.length === 0}
              onClick={() => {
                agregarItems(tipo, seleccionadosValidos);
                setSeleccionados([]);
              }}>
              Agregar
            </Button>
          </div>
        </div>
      )}

      <div className="h-48 overflow-y-auto border rounded p-2 pr-4">
        <div className="grid grid-cols-[2fr_1fr] font-bold text-sm mb-1">
          <div className="text-left">Nombre</div>
          <div className="text-right">DNI</div>
        </div>
        {[...elementos]
          .sort((a, b) => (a.lastname || "").localeCompare(b.lastname || ""))
          .map((el) => (
            <div
              key={el.dni}
              onClick={() => alternarSeleccion(el)}
              className={`grid grid-cols-[2fr_1fr] px-2 py-1 rounded mb-1 cursor-pointer text-white ${
                seleccionadosValidos.some((s) => s.dni === el.dni) ? `${color} font-bold` : ""
              }`}>
              <div className="text-left">{`${el.lastname} ${el.name}`}</div>
              <div className="text-right">{el.dni}</div>
            </div>
          ))}
      </div>

      {borrarItems && (
        <Button
          className="mt-4"
          color="failure"
          size="sm"
          disabled={seleccionadosValidos.length === 0}
          onClick={() => borrarItems(tipo, seleccionadosValidos)}>
          Eliminar {titulo}
        </Button>
      )}
    </Card>
  );
}
