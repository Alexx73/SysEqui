import { useState, useEffect } from "react";
import { UsersAPI } from "../api/UsersAPI";

export const useAlumnosProfesores = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);

  const getAlumnosYProfesores = async () => {
    try {
      const res = await UsersAPI.getAllUsers();
      const data = Array.isArray(res.data.users) ? res.data.users : [];

      const alumnosOrdenados = data
        .filter((u) => u.role === "student")
        .sort((a, b) => a.lastname.localeCompare(b.lastname));

      const profesoresOrdenados = data
        .filter((u) => u.role === "professor" || u.role === "preceptor")
        .sort((a, b) => a.lastname.localeCompare(b.lastname));

      setAlumnos(alumnosOrdenados);
      setProfesores(profesoresOrdenados);

      return { alumnos: alumnosOrdenados, profesores: profesoresOrdenados };
    } catch (error) {
      console.error("❌ Error al obtener alumnos y profesores", error);
      return { alumnos: [], profesores: [] };
    }
  };

  useEffect(() => {
    getAlumnosYProfesores();
  }, []);

  return { alumnos, profesores, getAlumnosYProfesores };
};
