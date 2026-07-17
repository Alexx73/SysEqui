const roleLabels = {
  admin: "administrador",
  student: "alumno",
  professor: "profesor",
  preceptor: "preceptor",
};

const routeEvents = [
  ["POST", /^\/users\/login$/, "Inicio de sesión"],
  ["POST", /^\/users\/logout$/, "Cierre de sesión"],
  ["POST", /^\/users\/register$/, "Registro de alumno"],
  ["GET", /^\/users$/, "Lista de usuarios"],
  ["GET", /^\/users\/staff(?:\/[^/]+)?$/, "Lista de profesores y preceptores"],
  ["GET", /^\/users\/unauth$/, "Lista de alumnos pendientes"],
  ["GET", /^\/users\/\d+$/, "Búsqueda de usuario"],
  ["POST", /^\/users\/unauth$/, "Alumno validado"],
  ["POST", /^\/users\/createStaff$/i, "Usuario de personal creado"],
  ["PATCH", /^\/users\/(?:profile|[^/]+)$/, "Perfil actualizado"],
  ["PATCH", /^\/users\/profile\/password$/, "Contraseña actualizada"],
  ["POST", /^\/users\/\d+\/request-password-reset$/, "Restablecimiento de contraseña solicitado"],
  ["POST", /^\/users\/complete-password-reset$/, "Contraseña restablecida"],
  ["POST", /^\/users\/(?:active|deactive)\/[^/]+$/, "Estado de usuario actualizado"],
  ["DELETE", /^\/users\/(?:unauth\/)?[^/]+$/, "Usuario eliminado"],
  ["GET", /^\/materias$/, "Lista de materias"],
  ["GET", /^\/materias\/[^/]+$/, "Materia consultada"],
  ["POST", /^\/materias$/, "Materia creada"],
  ["PATCH", /^\/materias\/[^/]+(?:\/activate)?$/, "Materia actualizada"],
  ["DELETE", /^\/materias\/[^/]+$/, "Materia eliminada"],
  ["GET", /^\/cursos$/, "Lista de cursos"],
  ["GET", /^\/cursos\/(?:searchByProfessor\/)?[^/]+$/, "Cursos consultados"],
  ["POST", /^\/cursos$/, "Curso creado"],
  ["PATCH", /^\/cursos\/assignNote\/[^/]+$/, "Nota asignada"],
  ["PATCH", /^\/cursos\/[^/]+$/, "Curso actualizado"],
  ["DELETE", /^\/cursos\/[^/]+$/, "Curso eliminado"],
  ["GET", /^\/(?:pendientes|completadas)$/, "Lista de equivalencias"],
  ["GET", /^\/(?:pendientes|completadas)\/[^/]+$/, "Equivalencia consultada"],
  ["POST", /^\/(?:pendientes|completadas)$/, "Equivalencia registrada"],
  ["PUT", /^\/completadas\/[^/]+$/, "Equivalencia actualizada"],
  ["DELETE", /^\/(?:pendientes|completadas)\/[^/]+$/, "Equivalencia eliminada"],
  ["GET", /^\/avisos$/, "Lista de avisos"],
  ["POST", /^\/avisos$/, "Aviso creado"],
  ["PATCH", /^\/avisos\/[^/]+$/, "Aviso actualizado"],
  ["DELETE", /^\/avisos\/[^/]+$/, "Aviso eliminado"],
];

const findAction = (method, path) => routeEvents.find(([verb, pattern]) => verb === method && pattern.test(path))?.[2];

const identity = (user) => {
  if (!user) return "";
  const name = [user.name, user.lastname].filter(Boolean).join(" ");
  const role = roleLabels[user.role] || user.role;
  const details = [role, user.dni && `DNI ${user.dni}`].filter(Boolean).join(", ");
  return name ? `${name}${details ? ` (${details})` : ""}` : details;
};

const activityLogs = (req, res, next) => {
  if (process.env.ACTIVITY_LOGS === "false") return next();

  const path = req.originalUrl.split("?")[0].replace(/\/+$/, "") || "/";
  const action = findAction(req.method, path);
  if (!action) return next();

  let responseBody;
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    const success = res.statusCode < 400;
    const level = success ? "OK" : res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 428 ? "AVISO" : "ERROR";
    const loginUser = path === "/users/login" && success ? responseBody?.userData : null;
    const actor = identity(loginUser || req.user);
    const attemptedDni = path === "/users/login" && !success && req.body?.dni ? `DNI ${req.body.dni}` : "";
    const subject = actor || attemptedDni;
    const result = success ? (req.method === "GET" ? "enviada" : "completado") : responseBody?.error || `falló con estado ${res.statusCode}`;
    console.log(`[ACTIVIDAD][${level}] ${action}${subject ? ` - ${subject}` : ""} - ${result}`);
  });

  return next();
};

export default activityLogs;
