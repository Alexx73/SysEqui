import AdminSidebar from "../components/admin/AdminSidebar";
import { useUser } from "../context/UserContext";
import { useState } from "react";

import { Card } from "flowbite-react";
const Inicio = () => {
  const { userData } = useUser();
  const [alumno, setAlumno] = useState({});

  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className="text-6xl font-bold">Bienvenido {userData.name + " " + userData.lastname}</h1>

      {/* <AdminSidebar /> */}
      {userData?.role === "admin" && <AdminSidebar />}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <Card href="#" className="max-w-sm">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Aviso 23/02/25</h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological
            order.
          </p>
        </Card>

        <Card href="#" className="max-w-sm">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Aviso 24/02/25</h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological
            order.
          </p>
        </Card>

        <Card href="#" className="max-w-sm">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Aviso 23/03/25</h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological
            order.
          </p>
        </Card>

        <Card href="#" className="max-w-sm">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Aviso 25/04/25</h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological
            order.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Inicio;

