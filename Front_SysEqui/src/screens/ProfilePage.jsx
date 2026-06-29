import { Card, Avatar, TextInput, Button, Label } from "flowbite-react";
import { Drawer } from "flowbite-react";
import { useUser } from "../context/UserContext";
import { HiOutlinePencilAlt, HiOutlineArrowLeft } from "react-icons/hi";
import { useState, useEffect } from "react";
import { UsersAPI } from "../api/UsersAPI";

export default function Profile({ isOpen = false, onClose }) {
  const [activeForm, setActiveForm] = useState("perfil");
  const { userData, updateUser } = useUser();
  const [editable, setEditable] = useState(false);
  const [btnPassword, setBtnPassword] = useState(false);
  const { ...initialFormValues } = userData;
  const [formData, setFormData] = useState(initialFormValues);
  const initials = userData.name[0] + userData.lastname[0];

  const [claveActual, setClaveActual] = useState(userData.password);
  const [claveNueva, setClaveNueva] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [errorClave, setErrorClave] = useState("");
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

  useEffect(() => {
    if (!btnPassword) return;

    if (!claveActual || !claveNueva || !confirmarClave) {
      setErrorClave("Todos los campos son obligatorios");
    } else if (claveNueva === claveActual) {
      setErrorClave("La nueva clave no puede ser igual a la actual");
    } else if (claveNueva !== confirmarClave) {
      setErrorClave("Las claves no coinciden");
    } else if (!passwordRegex.test(claveNueva)) {
      setErrorClave("La nueva clave debe tener al menos una mayúscula, una minúscula y un símbolo especial");
    } else {
      setErrorClave("");
    }
  }, [claveActual, claveNueva, confirmarClave, btnPassword]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleChangePassword = (e) => {
    setClaveActual({ ...claveActual, [e.target.id]: e.target.value });
    window.confirm(" Se actualizo la contraseña exitosamente");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...formData,
        [e.target.id]: e.target.value,
      };
      const response = await UsersAPI.updateOwnProfile(body);
      if (response?.status === 200) {
        setEditable(false);
        updateUser(body);
        window.confirm(response.data.message + "exitosamente");
      }
    } catch (error) {
      alert(error);
    }
  };
  return (
    <>
      <Drawer open={isOpen} onClose={onClose} position="left" className="w-[75%] max-w-[75%]">
        <Drawer.Items>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-600">
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors"
                title="Volver">
                <HiOutlineArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-white">Mi Perfil</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Card className="w-full bg-gray-900">
                <div className="flex flex-col gap-6 items-center p-4">
                  <Avatar placeholderInitials={initials} size="xl" rounded className="w-32 h-32 text-4xl" />
                  <Button
                    className="w-full"
                    onClick={() => {
                      setActiveForm("perfil");
                      setEditable(!editable);
                      setFormData(initialFormValues);
                    }}>
                    {editable ? "Cancelar" : "Editar perfil"}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setActiveForm("clave");
                      setBtnPassword(!btnPassword);
                    }}>
                    {btnPassword ? "Cancelar" : "Cambiar Clave"}
                  </Button>
                </div>
                <div className="min-h-[400px] items-center justify-center p-4">
                  {activeForm === "perfil" ? (
                    <div className="flex flex-col w-full space-y-4">
                      <div>
                        <Label htmlFor="dni">DNI</Label>
                        <TextInput id="dni" value={formData.dni} disabled readOnly />
                      </div>
                      <div>
                        <Label htmlFor="name">Nombre</Label>
                        <TextInput id="name" value={formData.name} disabled />
                      </div>
                      <div>
                        <Label htmlFor="lastname">Apellido</Label>
                        <TextInput id="lastname" value={formData.lastname} disabled />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <TextInput
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!editable}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <TextInput
                          id="phone"
                          type="number"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editable}
                          required
                          maxLength={10}
                        />
                      </div>
                      <Button onClick={handleSubmit} disabled={!editable} color="light">
                        Actualizar datos
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} className="flex flex-col w-full space-y-4">
                      <div>
                        <Label>Clave Actual</Label>
                        <TextInput
                          type="password"
                          value={claveActual}
                          onChange={(e) => setClaveActual(e.target.value)}
                          disabled={!btnPassword}
                          required
                        />
                      </div>
                      <div>
                        <Label>Nueva Clave</Label>
                        <TextInput
                          type="password"
                          value={claveNueva}
                          onChange={(e) => setClaveNueva(e.target.value)}
                          disabled={!btnPassword}
                          required
                        />
                      </div>
                      <div>
                        <Label>Confirmar Nueva Clave</Label>
                        <TextInput
                          type="password"
                          value={confirmarClave}
                          onChange={(e) => setConfirmarClave(e.target.value)}
                          disabled={!btnPassword}
                          required
                        />
                      </div>
                      {errorClave && <p className="text-red-500">{errorClave}</p>}
                      <Button type="submit" disabled={!btnPassword || errorClave !== ""} color="light">
                        Actualizar clave
                      </Button>
                    </form>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Drawer.Items>
      </Drawer>
    </>
  );
}
