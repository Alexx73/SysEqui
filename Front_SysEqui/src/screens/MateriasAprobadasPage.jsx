import { useEffect } from "react";

import { TabItem, Tabs } from "flowbite-react";
import { HiAdjustments, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";

import { useUser } from "../context/UserContext";
import { useMaterias } from "../utils/useMaterias";
import { useCursosAlumno } from "../utils/useCursosAlumno";

import TablaReutilizable from "../components/Tabla";

export default function MateriasAprobadas() {
  const { userData } = useUser();
  const { materias, loading: loadingMaterias } = useMaterias();
  const { cursosDelAlumno, loading, fetchCursosByDni } = useCursosAlumno(materias);

  useEffect(() => {
    if (userData?.dni && !loadingMaterias && materias.length > 0) {
      fetchCursosByDni(userData.dni);
    }
  }, [userData?.dni, loadingMaterias, materias]);

  const materiasAprobadas = cursosDelAlumno.filter((m) => m.aprobo);
  const materiasPendientes = cursosDelAlumno.filter((m) => !m.aprobo);

  if (loadingMaterias || loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-4">
      <h3 className="text-xl font-semibold mb-4">
        Alumno: {userData?.name} {userData?.lastname}
      </h3>

      <Tabs aria-label="Tabs with underline" variant="underline">
        <TabItem active title="Aprobadas" icon={HiUserCircle}>
          <TablaReutilizable
            datos={materiasAprobadas}
            columnas={[
              { clave: "nombre", titulo: "Materia" },
              { clave: "año", titulo: "Año" },
              { clave: "nota", titulo: "Nota" },
            ]}
          />
        </TabItem>

        <TabItem title="Pendientes" icon={MdDashboard}>
          <TablaReutilizable
            datos={materiasPendientes}
            columnas={[
              { clave: "nombre", titulo: "Materia" },
              { clave: "año", titulo: "Año" },
              { clave: "nota", titulo: "Nota" },
            ]}
          />
        </TabItem>

        <TabItem title="Perfil" icon={HiAdjustments}>
          <p className="text-sm mt-2">
            Información adicional del alumno: <br />
            <strong>
              {userData?.name} {userData?.lastname}
            </strong>
            <br />
            Email: <strong>{userData?.email}</strong>
            <br />
            DNI: <strong>{userData?.dni}</strong>
          </p>
        </TabItem>
      </Tabs>
    </div>
  );
}