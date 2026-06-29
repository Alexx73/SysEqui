export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center px-4">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Acceso denegado</h1>
      <p className="text-lg mb-6">No tienes permisos para acceder a esta página.</p>
      <a
        href="/inicio"
        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition font-semibold"
      >
        Volver al inicio
      </a>
    </div>
  );
}