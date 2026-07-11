import { useEffect, useState } from "react";
import { LuTrash2, LuUserCheck } from "react-icons/lu";
import { UsersAPI } from "../api/UsersAPI";
import { Button, Card, FloatingLabel, Table, TableRow } from "flowbite-react";
import PageTitle from "../components/PageTitle";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/toastContext";

const initialFilters = {
  dni: "",
  name: "",
  lastname: "",
  email: "",
  cellphone: "",
  createdAt: "",
};

const filterLabels = {
  dni: "DNI",
  name: "Nombre",
  lastname: "Apellido",
  email: "Email",
  cellphone: "Teléfono",
  createdAt: "Fecha creación",
};

export default function ValidarAlumnos() {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  function fetchUsers() {
    UsersAPI.getUnauthUsers()
      .then((response) => {
        if (response?.status === 200) {
          const users = response.data.users || [];
          setData(users);
          setFilteredData(users);
          return;
        }

        showToast({ message: response?.data?.error || "Error al obtener usuarios.", type: "error" });
      })
      .catch((error) => {
        showToast({ message: error?.message || "Error al obtener usuarios.", type: "error" });
      });
  }

  async function activateUser(id) {
    const response = await UsersAPI.validateUser({ accountId: id });
    if (response?.status !== 201) {
      showToast({ message: response?.data?.error || "Error al activar usuario.", type: "error" });
      return;
    }

    showToast({ message: "Usuario activado", type: "success" });
    fetchUsers();
  }

  async function deleteUser(id) {
    const response = await UsersAPI.deleteUser({ accountId: id });
    if (response?.status !== 200) {
      showToast({ message: response?.data?.error || "Error al eliminar usuario.", type: "error" });
      return;
    }

    showToast({ message: "Usuario eliminado", type: "success" });
    fetchUsers();
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    const filtered = data.filter((user) =>
      Object.keys(newFilters).every(
        (key) =>
          newFilters[key] === "" ||
          user[key]?.toString().toLowerCase().includes(newFilters[key].toLowerCase()),
      ),
    );
    setFilteredData(filtered);
  }

  const openConfirmModal = (user, type) => {
    setConfirmModal({
      title: type === "activate" ? "Activar usuario" : "Eliminar usuario",
      message:
        type === "activate"
          ? `¿Desea activar a ${user.name} ${user.lastname}?`
          : `¿Está seguro de que desea eliminar a ${user.name} ${user.lastname}? Esta acción no se puede deshacer.`,
      confirmLabel: type === "activate" ? "Activar" : "Eliminar",
      confirmColor: type === "activate" ? "success" : "failure",
      onConfirm: async () => {
        setConfirmModal(null);
        if (!user?._id) {
          showToast({ message: "Usuario no seleccionado", type: "warning" });
          return;
        }

        if (type === "activate") {
          await activateUser(user._id);
        } else {
          await deleteUser(user._id);
        }
      },
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4">
      <PageTitle>Validar Alumnos</PageTitle>
      <ConfirmModal
        open={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmModal?.onConfirm}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmColor={confirmModal?.confirmColor}
      />

      <Card className="w-full">
        <h4 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
          Buscar Alumnos
        </h4>

        <div className="flex flex-row justify-evenly items-center gap-8">
          {Object.keys(filters).map((key) => (
            <FloatingLabel
              key={key}
              variant="standard"
              label={filterLabels[key]}
              name={key}
              value={filters[key]}
              onChange={handleFilterChange}
            />
          ))}
        </div>
      </Card>

      <div className="overflow-x-auto w-full">
        <Table hoverable className="min-w-[600px] w-full">
          <Table.Head>
            <Table.HeadCell>DNI</Table.HeadCell>
            <Table.HeadCell>Nombre</Table.HeadCell>
            <Table.HeadCell>Apellido</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Teléfono</Table.HeadCell>
            <Table.HeadCell>Creado el</Table.HeadCell>
            <Table.HeadCell>Activar</Table.HeadCell>
            <Table.HeadCell>Borrar</Table.HeadCell>
          </Table.Head>

          <Table.Body className="divide-y">
            {filteredData.map((user) => (
              <TableRow key={user._id || user.dni}>
                <Table.Cell>{user.dni}</Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.lastname}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.cellphone}</Table.Cell>
                <Table.Cell>{user.createdAt}</Table.Cell>
                <Table.Cell>
                  <Button color="success" onClick={() => openConfirmModal(user, "activate")}>
                    <LuUserCheck />
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <Button color="failure" onClick={() => openConfirmModal(user, "delete")}>
                    <LuTrash2 />
                  </Button>
                </Table.Cell>
              </TableRow>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
