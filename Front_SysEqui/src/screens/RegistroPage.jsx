import { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { UsersAPI } from "../api/UsersAPI";
import { useNavigate } from "react-router-dom";

function Registro() {
  const navigate = useNavigate();
  // Estado inicial del formulario
  const initialFormValues = {
    dni: "",
    password: "",
    email: "",
    name: "",
    lastname: "",
    cellphone: "",
  };

  // Estado para almacenar los valores del formulario
  const [formValues, setFormValues] = useState(initialFormValues);

  // Estado para los errores de validación
  const [errors, setErrors] = useState({}); // errores por campo (dni, password, etc.)
  const [generalError, setGeneralError] = useState(""); // error general del backend

  // Manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  // Validar los campos del formulario
  const validate = () => {
    const newErrors = {};
    if (!formValues.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!formValues.lastname.trim()) newErrors.lastname = "El apellido es obligatorio.";
    if (!formValues.dni.trim() || isNaN(formValues.dni) || formValues.dni.length != 8)
      newErrors.dni = "El DNI debe ser un número válido - 8 digitos.";
    if (!formValues.cellphone.trim() || isNaN(formValues.cellphone))
      newErrors.cellphone = "El teléfono debe ser un número válido.";
    if (!formValues.email.trim() || !/\S+@\S+\.\S+/.test(formValues.email))
      newErrors.email = "El email no es válido.";
    if (!formValues.password.trim() || formValues.password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        // Enviar datos al backend
        const response = await UsersAPI.register(formValues);

        if (response?.status === 201) {
          setErrors("Registro exitoso");
          alert("Formulario enviado correctamente");

          // Limpiar el formulario
          setFormValues(initialFormValues);
          setErrors({});
          setGeneralError("");
        } else {
          // Manejo de errores específicos del backend
          const errorMessage = response?.data?.message;

          setErrors(`Error: ${errorMessage}`);
          alert(`Error: ${errorMessage}`);
        }
      } catch (error) {
        // Manejo de errores de red o inesperados
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Ocurrió un error inesperado. Por favor, intenta nuevamente.";
        setErrors(`Error: ${errorMessage}`);
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="container mx-auto  ">
      <h2 className="text-center font-bold text-lg">Sistema de Equivalencias - Registrarse</h2>

      <form className="flex max-w-md flex-col gap-4 mx-auto py-6" onSubmit={handleSubmit}>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name" value="Ingrese nombre" />
          </div>
          <TextInput
            id="name"
            type="text"
            placeholder="Tu nombre...."
            required
            value={formValues.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500">{errors.name}</p>}
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="lastname" value="Ingrese apellido" />
          </div>
          <TextInput
            id="lastname"
            type="text"
            placeholder="Tu apellido...."
            required
            value={formValues.lastname}
            onChange={handleChange}
          />
          {errors.lastname && <p className="text-red-500">{errors.lastname}</p>}
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="dni" value="Ingrese su DNI" />
          </div>
          <TextInput
            id="dni"
            type="text"
            placeholder="........"
            required
            value={formValues.dni}
            onChange={handleChange}
            maxLength={8}
            minLength={8}
          />
          {errors.dni && <p className="text-red-500 text-xs">{errors.dni}</p>}
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="cellphone" value="Ingrese su teléfono" />
          </div>
          <TextInput
            id="cellphone"
            type="text"
            placeholder="343......"
            required
            value={formValues.cellphone}
            onChange={handleChange}
            maxLength={10}
            minLength={8}
          />
          {errors.cellphone && <p className="text-red-500">{errors.cellphone}</p>}
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="email" value="Your email" />
          </div>
          <TextInput
            id="email"
            type="email"
            placeholder="name@flowbite.com"
            required
            value={formValues.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>}
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="password" value="Your password" />
          </div>
          <TextInput
            id="password"
            type="password"
            required
            value={formValues.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
        </div>

        <Button className="mt-6" type="submit">
          Enviar
        </Button>
        <p>
          si ya tenes cuenta
          <a
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/login")} // Llamas la función pasada desde App.js
          >
            {" "}
            Ingresa aca
          </a>
        </p>
      </form>
    </div>
  );
}

export default Registro;
