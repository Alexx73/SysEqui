import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Spinner } from "flowbite-react";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import AdminSidebar from "../components/admin/AdminSidebar";
import AvisoFormModal from "../components/AvisoFormModal";
import ConfirmModal from "../components/ConfirmModal";
import PageTitle from "../components/PageTitle";
import { useToast } from "../components/toastContext";
import { useUser } from "../context/UserContext";
import { AvisosAPI } from "../api/AvisosAPI";

const formatDate = (date) => new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));

const Inicio = () => {
  const { userData } = useUser();
  const { showToast } = useToast();
  const isAdmin = userData?.role === "admin";
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const loadAvisos = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await AvisosAPI.getAvisos();
    if (response?.status === 200) setAvisos(response.data.avisos || []);
    else setError(response?.data?.error || response?.data?.message || "No se pudieron cargar los avisos.");
    setLoading(false);
  }, []);

  useEffect(() => { loadAvisos(); }, [loadAvisos]);

  const openForm = (aviso) => {
    setEditing(aviso);
    setFormOpen(true);
  };

  const saveAviso = async (body) => {
    setSaving(true);
    const response = editing ? await AvisosAPI.updateAviso(editing._id, body) : await AvisosAPI.createAviso(body);
    setSaving(false);
    if (response?.status === 200 || response?.status === 201) {
      showToast({ message: editing ? "Aviso actualizado correctamente" : "Aviso creado correctamente", type: "success" });
      setFormOpen(false);
      setEditing(undefined);
      await loadAvisos();
    } else showToast({ message: response?.data?.error || "No se pudo guardar el aviso", type: "error" });
  };

  const deleteAviso = async () => {
    const response = await AvisosAPI.deleteAviso(deleting._id);
    setDeleting(null);
    if (response?.status === 200) {
      showToast({ message: "Aviso eliminado correctamente", type: "success" });
      await loadAvisos();
    } else showToast({ message: response?.data?.error || "No se pudo eliminar el aviso", type: "error" });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center gap-4">
      <PageTitle>Bienvenido {userData.name + " " + userData.lastname}</PageTitle>
      {isAdmin && <AdminSidebar />}
      {isAdmin && <div className="flex w-full max-w-4xl justify-end mt-3"><Button color="blue" onClick={() => openForm(undefined)}><HiPlus className="mr-2 h-5 w-5" />Nuevo aviso</Button></div>}

      {loading ? <div className="mt-10 flex items-center gap-3 text-gray-300"><Spinner /> Cargando avisos...</div> : error ? (
        <div className="mt-8 text-center"><p className="mb-4 text-red-400">{error}</p><Button color="gray" onClick={loadAvisos}>Reintentar</Button></div>
      ) : avisos.length === 0 ? <p className="mt-10 text-gray-400">No hay avisos disponibles.</p> : (
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 mt-4 md:grid-cols-2">
          {avisos.map((aviso) => (
            <Card key={aviso._id} className={`w-full ${!aviso.activo ? "opacity-55 border-dashed" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{aviso.titulo}</h5>
                    {!aviso.activo && <Badge color="gray">Inactivo</Badge>}
                  </div>
                  <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(aviso.createdAt)}</p>
                  <p className="whitespace-pre-wrap font-normal text-gray-700 dark:text-gray-300">{aviso.contenido}</p>
                </div>
              </div>
              {isAdmin && <div className="flex justify-end gap-2 border-t border-gray-700 pt-3"><Button size="xs" color="blue" onClick={() => openForm(aviso)}><HiPencil className="mr-1 h-4 w-4" />Editar</Button><Button size="xs" color="failure" onClick={() => setDeleting(aviso)}><HiTrash className="mr-1 h-4 w-4" />Eliminar</Button></div>}
            </Card>
          ))}
        </div>
      )}

      <AvisoFormModal open={formOpen} aviso={editing} saving={saving} onClose={() => { setFormOpen(false); setEditing(undefined); }} onSave={saveAviso} />
      <ConfirmModal open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={deleteAviso} title="Eliminar aviso" message={`¿Seguro que querés eliminar “${deleting?.titulo || ""}”? Esta acción no se puede deshacer.`} confirmLabel="Eliminar" confirmColor="failure" />
    </div>
  );
};

export default Inicio;
