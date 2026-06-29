import { useState, useEffect, useRef } from "react";
import { Button } from "flowbite-react";

export default function ModalNota({ isOpen, onClose, onConfirm, title = "Cargar Nota", nombreAlumno = "", añoMateria = "", initialValue = "" }) {
  const [nota, setNota] = useState(initialValue);
  const [botonActivo, setBotonActivo] = useState("confirmar");
  const btnConfirmarRef = useRef(null);
  const btnCancelarRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        setBotonActivo((prev) => (prev === "confirmar" ? "cancelar" : "confirmar"));
      } else if (e.key === "Enter") {
        if (botonActivo === "confirmar") {
          const notaNum = Number(nota);
          if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 10) {
            alert("La nota debe ser un número entero entre 1 y 10");
            return;
          }
          onConfirm(notaNum);
          setNota("");
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, botonActivo, nota, onClose, onConfirm]);

  useEffect(() => {
    if (botonActivo === "confirmar" && btnConfirmarRef.current) {
      btnConfirmarRef.current.focus();
    } else if (botonActivo === "cancelar" && btnCancelarRef.current) {
      btnCancelarRef.current.focus();
    }
  }, [botonActivo]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const notaNum = Number(nota);
    if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 10) {
      alert("La nota debe ser un número entero entre 1 y 10");
      return;
    }
    onConfirm(notaNum);
    setNota("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        {(nombreAlumno || añoMateria) && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {nombreAlumno && <span>Alumno: {nombreAlumno}</span>}
            {nombreAlumno && añoMateria && <span> - </span>}
            {añoMateria && <span>Año: {añoMateria}</span>}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nota" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nota (1-10)
            </label>
            <input
              id="nota"
              type="number"
              step="1"
              min="1"
              max="10"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Ingrese la nota"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              ref={btnCancelarRef}
              type="button"
              color="gray"
              onClick={onClose}
              className={botonActivo === "cancelar" ? "ring-2 ring-offset-2 ring-gray-500" : ""}>
              Cancelar
            </Button>
            <Button
              ref={btnConfirmarRef}
              type="submit"
              color="blue"
              className={botonActivo === "confirmar" ? "ring-2 ring-offset-2 ring-blue-500" : ""}>
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}