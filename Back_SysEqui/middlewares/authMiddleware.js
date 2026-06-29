import jwt from "jsonwebtoken";
// Cuando assert o alternativa deje de ser experimental usar
// import publicRoutes from "../configs/publicRoutes.json" assert { type: "json" };
// Mientras tanto usar esto:
import { readFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
const publicRoutes = JSON.parse(
  await readFile(join(fileURLToPath(new URL(".", import.meta.url)), "../configs/publicRoutes.json"), "utf8"),
);

const authMiddleware = (req, res, next) => {
  const publicPaths = publicRoutes;

  // Permitir acceso a las rutas públicas
  const path = req.path.replace(/\/+$/, "");
  if (
    publicPaths.some((route) => {
      const routeRegex = new RegExp(
        `^${route.path.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/:[a-zA-Z0-9_]+/g, "[^/]+")}$`
      );
      return routeRegex.test(path) && route.method === req.method;
    })
  ) {
    return next();
  }

  // Obtener el token de la cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access token missing or invalid" });
  }

  try {
    // Verificar el token con la clave secreta
    // Almacena los datos decodificados del token en req.user
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    // Limpia la cookie si el token es inválido o caducado
    res.clearCookie("token", { httpOnly: true, secure: true });
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
