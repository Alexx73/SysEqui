// Library
import { useEffect, useState } from "react";
import { LuTrash2, LuUserCheck } from "react-icons/lu";
import { FcSearch } from "react-icons/fc";
// API
import { UsersAPI } from "../api/UsersAPI";
// Flowbite
import { Button, Table, TableRow, Modal, FloatingLabel, Card } from "flowbite-react";

export default function ValidarAlumnos() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    dni: "",
    nombre: "",
    Apellido: "",
    email: "",
    Teléfono: "",
    FechaCreación: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  function fetchUsers() {
    UsersAPI.getUnauthUsers()
      .then((response) => {
        if (response?.status === 200) {
          setData(response.data.users);
          setFilteredData(response.data.users);
        }
      })
      .catch((error) => {
        alert("Error al obtener usuarios:", error);
      });
  }

  async function ActivateUser(id) {
    try {
      const response = await UsersAPI.validateUser({ accountId: id });
      if (response?.status === 201) {
        alert("Usuario activado");
        fetchUsers();
        setOpenModal(false);
      }
    } catch (error) {
      alert("Error al activar usuario:", error);
      setOpenModal(false);
    }
  }

  async function DeleteUser(id) {
    try {
      const response = await UsersAPI.deleteUser({ accountId: id });
      if (response?.status === 200) {
        alert("Usuario eliminado");
        fetchUsers();
        setOpenModal(false);
      }
    } catch (error) {
      alert("Error al eliminar usuario:", error);
    }
    setOpenModal(false);
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

  const handleConfirm = async () => {
    if (!selectedUser?._id) {
      alert("Usuario no seleccionado");
      return;
    }

    if (modalType === "activate") {
      await ActivateUser(selectedUser._id);
    } else {
      alert(`Borrando a ${selectedUser?.name} ${selectedUser?.lastname}?`);
      await DeleteUser(selectedUser._id);
    }

    setOpenModal(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4">
      <Modal size="md" show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>{modalType === "activate" ? "Activar Usuario" : "Eliminar Usuario"}</Modal.Header>
        <Modal.Body>
          <div className="space-y-6 text-center text-gray-500 dark:text-gray-400">
            <p>
              {modalType === "activate"
                ? `¿Desea activar a ${selectedUser?.name} ${selectedUser?.lastname}?`
                : `¿Está seguro de que desea eliminar a ${selectedUser?.name} ${selectedUser?.lastname}? Esta acción no se puede deshacer.`}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              modalType === "activate" ? ActivateUser(selectedUser._id) : DeleteUser(selectedUser._id);
            }}>
            {modalType === "activate" ? "Activar" : "Eliminar"}
          </Button>

          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="w-full">
        <h4 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
          Buscar Alumnos
        </h4>

        <div className="flex flex-row justify-evenly items-center gap-8">
          {Object.keys(filters).map((key) => (
            <FloatingLabel
              key={key}
              variant="standard"
              label={key.charAt(0).toUpperCase() + key.slice(1)}
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
            {filteredData.map((user, index) => (
              <TableRow key={index}>
                <Table.Cell>{user.dni}</Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.lastname}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.cellphone}</Table.Cell>
                <Table.Cell>{user.createdAt}</Table.Cell>
                <Table.Cell>
                  <Button
                    color="success"
                    onClick={() => {
                      setSelectedUser(user);
                      setModalType("activate");
                      setOpenModal(true);
                    }}>
                    <LuUserCheck />
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    color="failure"
                    onClick={() => {
                      setSelectedUser(user);
                      setModalType("delete");
                      setOpenModal(true);
                    }}>
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