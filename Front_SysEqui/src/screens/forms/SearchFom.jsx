import { useImperativeHandle, forwardRef, useState } from "react";
import { Button, TextInput, Label } from "flowbite-react";

const SearchForm = forwardRef(({ onSearch }, ref) => {
  const [filters, setFilters] = useState({
    dni: "",
    name: "",
    lastname: "",
    email: "",
    phone: "",
    createdAt: "",
    role: "",
    activeStatus: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const isEmpty = Object.values(filters).every((val) => val.trim() === "");
    if (isEmpty) {
      onSearch({}); // Mostrar todos
    } else {
      onSearch(filters);
    }
  };

  const handleReset = () => {
    const empty = {
      dni: "",
      name: "",
      lastname: "",
      email: "",
      phone: "",
      createdAt: "",
      role: "",
      activeStatus: "",
    };
    setFilters(empty);
    onSearch({}); // Mostrar todos
  };

  useImperativeHandle(ref, () => ({
    resetForm: handleReset,
  }));

  return (
    <div>
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 items-end p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
        {["dni", "name", "lastname", "email", "phone", "createdAt"].map((key) => (
          <div key={key}>
            <Label htmlFor={key} value={key.charAt(0).toUpperCase() + key.slice(1)} className="text-xs" />
            <TextInput
              id={key}
              name={key}
              type={key === "createdAt" ? "date" : "text"}
              value={filters[key]}
              onChange={handleChange}
              className="h-8 w-full text-sm"
            />
          </div>
        ))}

        <div>
          <Label htmlFor="role" value="Rol" className="text-xs" />
          <select
            id="role"
            name="role"
            value={filters.role}
            onChange={handleChange}
            className="h-8 w-full text-sm rounded-md border-gray-300 dark:bg-gray-700 dark:text-white">
            <option value="">Todos</option>
            <option value="preceptor">Preceptor</option>
            <option value="professor">Profesor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <Label htmlFor="activeStatus" value="Estado" className="text-xs" />
          <select
            id="activeStatus"
            name="activeStatus"
            value={filters.activeStatus}
            onChange={handleChange}
            className="h-8 w-full text-sm rounded-md border-gray-300 dark:bg-gray-700 dark:text-white">
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Desactivados</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Button type="submit" color="blue" className="h-8 w-full text-sm">
            Buscar
          </Button>
          <Button type="button" color="gray" onClick={handleReset} className="h-8 w-full text-sm">
            Listar todos
          </Button>
        </div>
      </form>
    </div>
  );
});

export default SearchForm;

