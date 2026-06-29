import { useState, useEffect } from "react";
import { Label, TextInput, Button, Select } from "flowbite-react";

export default function MyForm({
  campos = [],
  onSubmit,
  botonTexto = "Enviar",
  datosIniciales,
  modoEdicion = false,
  setModoEdicion = false,
  setDatosFormulario,
  setModalOpen,
}) {
  const inicializarFormulario = () => {
    return campos.reduce((acc, campo) => {
      const valorInicial =
        datosIniciales?.[campo.name] ??
        (campo.name === "year" ? "1" : campo.type === "select" ? campo.opciones?.[0] || "" : "");
      acc[campo.name] = valorInicial;
      return acc;
    }, {});
  };

  const [form, setForm] = useState(inicializarFormulario);
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    let valid = true;
    const nuevosErrores = {};

    campos.forEach((campo) => {
      const valor = form[campo.name];
      if (campo.required && !valor) {
        nuevosErrores[campo.name] = "Este campo es obligatorio";
        valid = false;
      }
      if (campo.pattern && !campo.pattern.test(valor)) {
        nuevosErrores[campo.name] = campo.mensajeError || "Formato inválido";
        valid = false;
      }
    });

    setErrores(nuevosErrores);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      onSubmit(form);
      // Reutilizar inicializarFormulario para limpiar valores
      setForm(inicializarFormulario());
      setErrores({});
    }
    setModalOpen(false);
  };

  useEffect(() => {
    setForm(inicializarFormulario());
  }, [datosIniciales]);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
      {campos.map((campo) => (
        <div key={campo.name}>
          <Label htmlFor={campo.name} value={campo.label} />
          {campo.type === "select" ? (
            <Select
              id={campo.name}
              name={campo.name}
              value={form[campo.name]}
              onChange={handleChange}
              required={campo.required}>
              {campo.opciones.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </Select>
          ) : (
            <TextInput
              id={campo.name}
              type={campo.type || "text"}
              name={campo.name}
              value={form[campo.name]}
              onChange={handleChange}
              required={campo.required}
              color={errores[campo.name] ? "failure" : undefined}
              helperText={errores[campo.name] && <span className="text-red-600">{errores[campo.name]}</span>}
            />
          )}
        </div>
      ))}

      <div className="grid  grid:cols-3 sm:grid-cols-2 md:grid-cols-2 sm:col-span-2 md:col-span-3 gap-4 mt-4 pb-4 ">
        <div>
          <Button className="w-full " type="submit">
            {botonTexto}
          </Button>
        </div>

        <div>
          {modoEdicion && (
            <Button
              className="w-full "
              color="failure"
              // onClick={() => setModoEdicion(false)}
              onClick={() => {
                setModoEdicion(false);
                setDatosFormulario(null);
                setErrores({});
                setModalOpen(false);
              }}>
              Cancelar
            </Button>
          )}
        </div>

        {/* <Button className="w-1/3 bg-red-800 ">Cancelar</Button> */}
      </div>
    </form>
  );
}
