import { useEffect, useState } from "react";
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Textarea, TextInput, ToggleSwitch } from "flowbite-react";

const EMPTY_FORM = { titulo: "", contenido: "", activo: true };

export default function AvisoFormModal({ open, aviso, saving, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(aviso ? { titulo: aviso.titulo, contenido: aviso.contenido, activo: aviso.activo } : EMPTY_FORM);
      setError("");
    }
  }, [aviso, open]);

  const submit = (event) => {
    event.preventDefault();
    const titulo = form.titulo.trim();
    const contenido = form.contenido.trim();
    if (!titulo || !contenido) return setError("El título y el contenido son obligatorios.");
    if (titulo.length > 120 || contenido.length > 2000) return setError("Revisá los límites de caracteres.");
    setError("");
    onSave({ ...form, titulo, contenido });
  };

  return (
    <Modal show={open} onClose={saving ? undefined : onClose} size="lg">
      <form onSubmit={submit}>
        <ModalHeader>{aviso ? "Editar aviso" : "Nuevo aviso"}</ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            <div>
              <div className="mb-2 block"><Label htmlFor="aviso-titulo">Título</Label></div>
              <TextInput id="aviso-titulo" maxLength={120} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              <p className="mt-1 text-right text-xs text-gray-400">{form.titulo.length}/120</p>
            </div>
            <div>
              <div className="mb-2 block"><Label htmlFor="aviso-contenido">Contenido</Label></div>
              <Textarea id="aviso-contenido" rows={7} maxLength={2000} value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} required />
              <p className="mt-1 text-right text-xs text-gray-400">{form.contenido.length}/2000</p>
            </div>
            <ToggleSwitch checked={form.activo} label={form.activo ? "Aviso activo" : "Aviso inactivo"} onChange={(activo) => setForm({ ...form, activo })} />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" color="blue" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          <Button type="button" color="gray" onClick={onClose} disabled={saving}>Cancelar</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
