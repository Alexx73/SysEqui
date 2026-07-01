import { useCallback, useEffect, useState } from "react";
import { FaBook, FaChalkboardTeacher, FaUserTie } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";
import { PiStudentFill } from "react-icons/pi";
import { SiGoogleclassroom } from "react-icons/si";
import { CursosAPI } from "../../api/CursosAPI";
import { MateriasAPI } from "../../api/MateriasAPI";
import { UsersAPI } from "../../api/UsersAPI";

const initialStats = { students: 0, subjects: 0, courses: 0, professors: 0, preceptors: 0 };
const initialPeople = { student: [], professor: [], preceptor: [] };

const statCards = [
  { key: "students", role: "student", label: "Alumnos", icon: PiStudentFill, iconClasses: "bg-blue-500/15 text-blue-400" },
  { key: "professors", role: "professor", label: "Profesores", icon: FaChalkboardTeacher, iconClasses: "bg-amber-500/15 text-amber-400" },
  { key: "preceptors", role: "preceptor", label: "Preceptores", icon: FaUserTie, iconClasses: "bg-rose-500/15 text-rose-400" },
  { key: "courses", label: "Cursos", icon: SiGoogleclassroom, iconClasses: "bg-violet-500/15 text-violet-400" },
  { key: "subjects", label: "Materias", icon: FaBook, iconClasses: "bg-emerald-500/15 text-emerald-400" },
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

const sortPeople = (people) =>
  [...people].sort((first, second) =>
    `${first.lastname ?? ""} ${first.name ?? ""}`.localeCompare(
      `${second.lastname ?? ""} ${second.name ?? ""}`,
      "es",
      { sensitivity: "base" },
    ),
  );

const getCreationDate = (id) => {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) return "Fecha no disponible";
  const date = new Date(Number.parseInt(id.slice(0, 8), 16) * 1000);
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const PaginationControls = ({ page, pageSize, totalItems, onPageChange, onPageSizeChange }) => {
  if (totalItems <= 5) return null;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
      <label className="flex items-center gap-2 text-sm text-gray-400">
        Mostrar
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-md border border-blue-500/50 bg-gray-800 px-2 py-1 text-blue-100 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400">
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        por página
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-md border border-blue-500/50 bg-blue-600/20 px-3 py-1 text-sm text-blue-100 transition hover:bg-blue-600/40 disabled:cursor-not-allowed disabled:opacity-40">
          Anterior
        </button>
        <span className="text-sm text-gray-400">Página {page} de {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-md border border-blue-500/50 bg-blue-600/20 px-3 py-1 text-sm text-blue-100 transition hover:bg-blue-600/40 disabled:cursor-not-allowed disabled:opacity-40">
          Siguiente
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(initialStats);
  const [peopleByRole, setPeopleByRole] = useState(initialPeople);
  const [courseDetails, setCourseDetails] = useState([]);
  const [subjectDetails, setSubjectDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [pagination, setPagination] = useState({});

  const updatePage = (key, page) => {
    setPagination((current) => ({
      ...current,
      [key]: { page, pageSize: current[key]?.pageSize ?? 5 },
    }));
  };

  const updatePageSize = (key, pageSize) => {
    setPagination((current) => ({ ...current, [key]: { page: 1, pageSize } }));
  };

  const toggleCard = (key) => {
    setExpandedCards((current) => ({ ...current, [key]: !current[key] }));
  };

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
      const activeSubjects = subjects
        .filter((subject) => subject.active === true)
        .sort((first, second) => first.name.localeCompare(second.name, "es", { sensitivity: "base" }));
      const subjectNames = new Map(subjects.map((subject) => [String(subject._id), subject.name]));
      const detailedCourses = courses
        .map((course) => ({
          ...course,
          subjectName: subjectNames.get(String(course.idMateria)) || "Materia no disponible",
          studentCount: Array.isArray(course.alumnos) ? course.alumnos.length : 0,
        }))
        .sort((first, second) =>
          first.subjectName.localeCompare(second.subjectName, "es", { sensitivity: "base" }),
        );
      const people = {
        student: sortPeople(activeUsers.filter((user) => user.role === "student")),
        professor: sortPeople(activeUsers.filter((user) => user.role === "professor")),
        preceptor: sortPeople(activeUsers.filter((user) => user.role === "preceptor")),
      };

      setPeopleByRole(people);
      setCourseDetails(detailedCourses);
      setSubjectDetails(activeSubjects);
      setStats({
        students: people.student.length,
        subjects: activeSubjects.length,
        courses: detailedCourses.length,
        professors: people.professor.length,
        preceptors: people.preceptor.length,
      });
    } catch (requestError) {
      console.error("Error al cargar las estadísticas del administrador:", requestError);
      setError("No pudimos cargar el resumen general. Verificá la conexión e intentá nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
          Panel de administrador
        </p>
        <h1 className="text-3xl font-bold text-white">Resumen general</h1>
        <p className="mt-2 text-gray-400">Información actualizada de los registros activos del sistema.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center" role="alert">
          <p className="text-red-200">{error}</p>
          <button
            type="button"
            onClick={loadStats}
            className="mt-4 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300">
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
          {statCards.map(({ key, role, label, icon: Icon, iconClasses }) => {
            const people = role ? peopleByRole[role] : null;
            const list = people ?? (key === "courses" ? courseDetails : key === "subjects" ? subjectDetails : []);
            const pageConfig = pagination[key] ?? { page: 1, pageSize: 5 };
            const totalPages = Math.max(1, Math.ceil(list.length / pageConfig.pageSize));
            const currentPage = Math.min(pageConfig.page, totalPages);
            const startIndex = (currentPage - 1) * pageConfig.pageSize;
            const paginatedItems = list.slice(startIndex, startIndex + pageConfig.pageSize);

            return (
              <article
                key={key}
                className="rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-lg shadow-black/10">
                <button
                  type="button"
                  onClick={() => toggleCard(key)}
                  aria-expanded={Boolean(expandedCards[key])}
                  aria-controls={`stat-${key}`}
                  className="flex w-full items-center gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}>
                    <Icon className="text-xl" aria-hidden="true" />
                  </span>
                  <span className="flex-1 font-semibold text-white">
                    {label} ({isLoading ? "…" : stats[key]})
                  </span>
                  <HiChevronDown
                    className={`text-xl text-gray-400 transition-transform duration-300 ${
                      expandedCards[key] ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={`stat-${key}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    expandedCards[key] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                  <div className="overflow-hidden">
                    {isLoading ? (
                      <div
                        className="mt-5 h-10 w-20 animate-pulse rounded-md bg-gray-700"
                        aria-label={`Cargando datos de ${label.toLowerCase()}`}
                      />
                    ) : people ? (
                      <div className="mt-5 overflow-x-auto border-t border-gray-700 pt-4">
                        {people.length === 0 ? (
                          <p className="text-sm text-gray-400">No hay {label.toLowerCase()} activos.</p>
                        ) : (
                          <table className="w-full min-w-[420px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-gray-400">
                              <tr>
                                <th className="w-10 px-3 py-2 text-center font-semibold">#</th>
                                <th className="px-3 py-2 font-semibold">Apellido</th>
                                <th className="px-3 py-2 font-semibold">Nombre</th>
                                <th className="px-3 py-2 font-semibold">DNI</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {paginatedItems.map((person, index) => (
                                <tr key={person._id ?? person.dni} className="text-gray-200">
                                  <td className="px-3 py-3 text-center tabular-nums">{startIndex + index + 1}</td>
                                  <td className="px-3 py-3">{person.lastname || "—"}</td>
                                  <td className="px-3 py-3">{person.name || "—"}</td>
                                  <td className="px-3 py-3 tabular-nums">{person.dni || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ) : key === "courses" ? (
                      <div className="mt-5 overflow-x-auto border-t border-gray-700 pt-4">
                        {courseDetails.length === 0 ? (
                          <p className="text-sm text-gray-400">No hay cursos registrados.</p>
                        ) : (
                          <table className="w-full min-w-[380px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-gray-400">
                              <tr>
                                <th className="w-10 px-3 py-2 text-center font-semibold">#</th>
                                <th className="px-3 py-2 font-semibold">Nombre</th>
                                <th className="px-3 py-2 text-center font-semibold">Alumnos</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {paginatedItems.map((course, index) => (
                                <tr key={course._id} className="text-gray-200">
                                  <td className="px-3 py-3 text-center tabular-nums">{startIndex + index + 1}</td>
                                  <td className="px-3 py-3">{course.subjectName}</td>
                                  <td className="px-3 py-3 text-center tabular-nums">{course.studentCount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ) : key === "subjects" ? (
                      <div className="mt-5 overflow-x-auto border-t border-gray-700 pt-4">
                        {subjectDetails.length === 0 ? (
                          <p className="text-sm text-gray-400">No hay materias activas.</p>
                        ) : (
                          <table className="w-full min-w-[480px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-gray-400">
                              <tr>
                                <th className="w-10 px-3 py-2 text-center font-semibold">#</th>
                                <th className="px-3 py-2 font-semibold">Nombre</th>
                                <th className="px-3 py-2 text-center font-semibold">Año</th>
                                <th className="px-3 py-2 font-semibold">Fecha de creación</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {paginatedItems.map((subject, index) => (
                                <tr key={subject._id} className="text-gray-200">
                                  <td className="px-3 py-3 text-center tabular-nums">{startIndex + index + 1}</td>
                                  <td className="px-3 py-3">{subject.name || "—"}</td>
                                  <td className="px-3 py-3 text-center tabular-nums">{subject.year || "—"}</td>
                                  <td className="px-3 py-3 tabular-nums">{getCreationDate(subject._id)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ) : null}
                    {!isLoading && (
                      <PaginationControls
                        page={currentPage}
                        pageSize={pageConfig.pageSize}
                        totalItems={list.length}
                        onPageChange={(page) => updatePage(key, page)}
                        onPageSizeChange={(pageSize) => updatePageSize(key, pageSize)}
                      />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
