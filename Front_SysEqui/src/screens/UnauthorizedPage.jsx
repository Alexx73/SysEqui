export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center text-gray-900 dark:bg-gray-900 dark:text-white">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Acceso denegado</h1>
      <p className="text-lg mb-6">No tienes permisos para acceder a esta página.</p>
      <a
        href="/inicio"
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
      >
        Volver al inicio
      </a>
    </div>
  );
}
