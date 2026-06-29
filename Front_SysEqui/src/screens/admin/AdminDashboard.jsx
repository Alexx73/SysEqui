const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel de Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl mb-2">Usuarios Totales</h2>
          <p className="text-gray-300">234 alumnos registrados</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl mb-2">Equivalencias</h2>
          <p className="text-gray-300">18 pendientes</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

