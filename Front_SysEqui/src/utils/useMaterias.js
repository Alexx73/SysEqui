// hooks/useMaterias.js
import { useState, useEffect } from "react";
import { MateriasAPI } from "../api/MateriasAPI";

export function useMaterias() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterias = async () => {
    try {
      const res = await MateriasAPI.getMateriasAll();
      let data = Array.isArray(res.data.equivalencias) ? res.data.equivalencias : [];

      data.sort((a, b) => (b.year !== a.year ? a.year - b.year : a.name.localeCompare(b.name)));
      setMaterias([...data]); // Forzamos nueva referencia para re-render

      return data; // ✅ 🔥 ESTA LÍNEA SOLUCIONA TU PROBLEMA
    } catch (err) {
      console.error("❌ Error al obtener materias:", err);
      return []; // fallback seguro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  return { materias, loading, fetchMaterias };
}
