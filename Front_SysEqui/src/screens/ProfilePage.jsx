import { Card, Avatar, TextInput, Button, Label } from "flowbite-react";
import { Drawer } from "flowbite-react";
import { useUser } from "../context/UserContext";
import { HiEye, HiEyeOff, HiOutlineArrowLeft } from "react-icons/hi";
import { useState, useEffect } from "react";
import { UsersAPI } from "../api/UsersAPI";
import { passwordRulesText, validatePasswordRules } from "../utils/passwordValidation";
import { useToast } from "../components/toastContext";

export default function Profile({ isOpen = false, onClose }) {
  const { showToast } = useToast();
  const [activeForm, setActiveForm] = useState("perfil");
  const { userData, updateUser } = useUser();
  const [editable, setEditable] = useState(false);
  const [btnPassword, setBtnPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const { ...initialFormValues } = userData;
  const [formData, setFormData] = useState(initialFormValues);
  const initials = userData.name[0] + userData.lastname[0];

  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [errorClave, setErrorClave] = useState("");

  useEffect(() => {
    if (!btnPassword) return;

    if (!claveActual || !claveNueva || !confirmarClave) {
      setErrorClave("Todos los campos son obligatorios");
    } else if (claveNueva === claveActual) {
      setErrorClave("La nueva clave no puede ser igual a la actual");
    } else if (claveNueva !== confirmarClave) {
      setErrorClave("Las claves no coinciden");
    } else {
      setErrorClave(validatePasswordRules(claveNueva));
    }
  }, [claveActual, claveNueva, confirmarClave, btnPassword]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (errorClave) return;

    const response = await UsersAPI.updateOwnPassword({
      currentPassword: claveActual,
      newPassword: claveNueva,
      confirmPassword: confirmarClave,
    });

    if (response?.status === 200) {
      setClaveActual("");
      setClaveNueva("");
      setConfirmarClave("");
      setBtnPassword(false);
      setShowPasswords(false);
      setActiveForm("perfil");
      showToast({ message: response.data?.message || "Contraseña actualizada", type: "success" });
      return;
    }

    setErrorClave(response?.data?.error || "No se pudo actualizar la contraseña");
  };
  const handleClose = () => {
    setShowPasswords(false);
    onClose();
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
        showToast({ message: response.data?.message || "Perfil actualizado correctamente", type: "success" });
      }
    } catch (error) {
      showToast({ message: error?.message || "No se pudo actualizar el perfil", type: "error" });
    }
  };
  return (
    <>
      <Drawer open={isOpen} onClose={handleClose} position="left" className="w-[75%] max-w-[75%]">
        <Drawer.Items>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-600">
              <button
                onClick={handleClose}
                className="text-gray-300 hover:text-white transition-colors"
                title="Volver">
                <HiOutlineArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-white">Mi Perfil</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Card className="w-full bg-gray-900">
                <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 p-4">
                  <Avatar placeholderInitials={initials} size="xl" rounded className="w-32 h-32 text-4xl" />
                  <Button
                    className="w-full"
                    onClick={() => {
                      setActiveForm("perfil");
                      setShowPasswords(false);
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
                      setShowPasswords(false);
                      setClaveActual("");
                      setClaveNueva("");
                      setConfirmarClave("");
                      setErrorClave("");
                    }}>
                    {btnPassword ? "Cancelar" : "Cambiar Clave"}
                  </Button>
                </div>
                <div className="min-h-[400px] items-center justify-center p-4">
                  {activeForm === "perfil" ? (
                    <div className="mx-auto flex w-full max-w-xl flex-col space-y-4">
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
                    <form onSubmit={handleChangePassword} className="mx-auto flex w-full max-w-xl flex-col space-y-4">
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => setShowPasswords((current) => !current)}
                          aria-label={showPasswords ? "Ocultar claves" : "Mostrar claves"}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {showPasswords ? (
                            <HiEyeOff className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <HiEye className="h-5 w-5" aria-hidden="true" />
                          )}
                          {showPasswords ? "Ocultar claves" : "Mostrar claves"}
                        </button>
                      </div>
                      <div>
                        <Label className="text-gray-200">Clave actual</Label>
                        <TextInput
                          type={showPasswords ? "text" : "password"}
                          value={claveActual}
                          onChange={(e) => setClaveActual(e.target.value)}
                          disabled={!btnPassword}
                          required
                        />
                      </div>
                      <div className="group relative">
                        <Label className="text-gray-200">Nueva clave</Label>
                        <TextInput
                          type={showPasswords ? "text" : "password"}
                          value={claveNueva}
                          onChange={(e) => setClaveNueva(e.target.value)}
                          disabled={!btnPassword}
                          required
                          aria-describedby="password-rules"
                        />
                        <p
                          id="password-rules"
                          className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-max max-w-full rounded-md border border-yellow-300 bg-yellow-100 px-3 py-2 text-xs font-semibold text-yellow-900 shadow-lg group-hover:block group-focus-within:block">
                          {passwordRulesText}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-200">Confirmar nueva clave</Label>
                        <TextInput
                          type={showPasswords ? "text" : "password"}
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
