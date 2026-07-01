import { useCallback, useEffect, useState } from "react";
import { FaBook, FaChalkboardTeacher, FaUserTie } from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";
import { SiGoogleclassroom } from "react-icons/si";
import { CursosAPI } from "../../api/CursosAPI";
import { MateriasAPI } from "../../api/MateriasAPI";
import { UsersAPI } from "../../api/UsersAPI";

const initialStats = { students: 0, subjects: 0, courses: 0, professors: 0, preceptors: 0 };

const statCards = [
  { key: "students", label: "Alumnos", icon: PiStudentFill, iconClasses: "bg-blue-500/15 text-blue-400" },
  { key: "subjects", label: "Materias", icon: FaBook, iconClasses: "bg-emerald-500/15 text-emerald-400" },
  { key: "courses", label: "Cursos", icon: SiGoogleclassroom, iconClasses: "bg-violet-500/15 text-violet-400" },
  { key: "professors", label: "Profesores", icon: FaChalkboardTeacher, iconClasses: "bg-amber-500/15 text-amber-400" },
  { key: "preceptors", label: "Preceptores", icon: FaUserTie, iconClasses: "bg-rose-500/15 text-rose-400" },
];

const getArrayFromResponse = (response, property) => {
  if (response?.status === 404) return [];

  if (!response || response.status < 200 || response.status >= 300) {
    throw new Error("No se pudieron obtener las estadísticas");
  }
  const collection = response.data?.[property];
  if (!Array.isArray(collection)) throw new Error("La respuesta recibida no es válida");
  return collection;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [usersResponse, subjectsResponse, coursesResponse] = await Promise.all([
        UsersAPI.getAllUsers(),
        MateriasAPI.getMateriasAll(),
        CursosAPI.getAllCursos(),
      ]);
      const users = getArrayFromResponse(usersResponse, "users");
      const subjects = getArrayFromResponse(subjectsResponse, "equivalencias");
      const courses = getArrayFromResponse(coursesResponse, "cursos");
      const activeUsers = users.filter((user) => user.isActive === true);
      setStats({
        students: activeUsers.filter((user) => user.role === "student").length,
        subjects: subjects.filter((subject) => subject.active === true).length,
        courses: courses.length,
        professors: activeUsers.filter((user) => user.role === "professor").length,
        preceptors: activeUsers.filter((user) => user.role === "preceptor").length,
      });
    } catch (requestError) {
      console.error("Error al cargar las estadísticas del administrador:", requestError);
      setError("No pudimos cargar el resumen general. Verificá la conexión e intentá nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">Panel de administrador</p>
        <h1 className="text-3xl font-bold text-white">Resumen general</h1>
        <p className="mt-2 text-gray-400">Información actualizada de los registros activos del sistema.</p>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center" role="alert">
          <p className="text-red-200">{error}</p>
          <button type="button" onClick={loadStats} className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300">Reintentar</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map(({ key, label, icon: Icon, iconClasses }) => (
            <article key={key} className="rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-lg shadow-black/10">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${iconClasses}`}>
                <Icon className="text-2xl" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-gray-400">{label}</p>
              {isLoading ? (
                <div className="mt-2 h-10 w-20 animate-pulse rounded-md bg-gray-700" aria-label={`Cargando cantidad de ${label.toLowerCase()}`} />
              ) : (
                <p className="mt-1 text-4xl font-bold text-white">{stats[key]}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
