import { useState } from "react";
import { CursosAPI } from "../api/CursosAPI";

export const useCursos = () => {
  const [cursos, setCursos] = useState([]);

  const getCursos = async (materias = [], alumnos = [], profesores = []) => {
    try {
      if (!Array.isArray(materias) || !Array.isArray(alumnos) || !Array.isArray(profesores)) {
        console.warn("⚠️ Datos inválidos en getCursos", { materias, alumnos, profesores });
        return;
      }

      const res = await CursosAPI.getAllCursos();
      const data = Array.isArray(res.data.cursos) ? res.data.cursos : [];

      const alumnosById = Object.fromEntries(alumnos.map((a) => [String(a._id), a]));
      const profesoresById = Object.fromEntries(profesores.map((p) => [String(p._id), p]));

      const cursosConNombreMateria = data.map((curso) => {
        const materia = materias.find((m) => String(m._id) === String(curso.idMateria));

        const alumnosCompletos = (curso.alumnos || [])
          .map((a) => {
            const idAlumno = a?.idAlumno || a?._id || a;
            const alumno = alumnosById[String(idAlumno)];
            return alumno ? { ...alumno, idAlumno, nota: a?.nota || 0 } : null;
          })
          .filter(Boolean);

        const docentesCompletos = (curso.docentesEncargados || [])
          .map((id) => profesoresById[String(id)])
          .filter(Boolean);

        return {
          ...curso,
          materia: materia?.name || "Materia desconocida",
          alumnos: alumnosCompletos,
          docentesEncargados: docentesCompletos,
        };
      });

      setCursos(cursosConNombreMateria);
    } catch (error) {
      console.error("❌ Error al obtener cursos:", error); // corregido el alert.error
    }
  };

  return { cursos, getCursos, setCursos }; // ✅ devolvemos setCursos también
};
