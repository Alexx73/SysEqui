import { useState } from "react";
import { CursosAPI } from "../api/CursosAPI";
import { UsersAPI } from "../api/UsersAPI";

export const useCursosAlumno = (materias = []) => {
  const [cursosDelAlumno, setCursosDelAlumno] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCursosByAlumnoId = async (alumnoId) => {
    if (!alumnoId) {
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const res = await CursosAPI.getAllCursos();
      const cursos = res.data.cursos || [];

      const cursosFiltrados = cursos
        .filter((curso) => curso.alumnos?.some((a) => (a._id || a) === alumnoId))
        .map((curso) => {
          const materia = materias.find((m) => String(m._id) === String(curso.idMateria));
          const alumnoData = curso.alumnos?.find((a) => (a._id || a) === alumnoId);

          return {
            ...curso,
            nombre: materia?.name || "Sin materia",
            año: materia?.year || "",
            nota: Number(alumnoData?.nota) || 0,
            notaOriginal: alumnoData?.nota,
            aprobo: Number(alumnoData?.nota) >= 6,
          };
        })
        .sort((a, b) => a.año - b.año || a.nombre.localeCompare(b.nombre));

      setCursosDelAlumno(cursosFiltrados);
      return cursosFiltrados;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCursosByDni = async (dni) => {
    if (!dni) {
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const resUser = await UsersAPI.getUsersByDni(dni);
      if (!resUser?.data?.user?._id) {
        setError("Usuario no encontrado");
        return [];
      }

      return await fetchCursosByAlumnoId(resUser.data.user._id);
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  return {
    cursosDelAlumno,
    loading,
    error,
    fetchCursosByAlumnoId,
    fetchCursosByDni,
  };
};