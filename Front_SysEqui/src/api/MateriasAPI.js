import axios from "axios";

const baseRoute = `${import.meta.env.VITE_URL_BACK}/materias`;
axios.defaults.withCredentials = true;

export const MateriasAPI = {
  getMateriasAll: async () => {
    try {
      const response = await axios.get(`${baseRoute}`);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  createMateria: async (body) => {
    try {
      const response = await axios.post(`${baseRoute}`, body);
      return response;
    } catch (error) {
      throw error; // 🔥 Esto activa el catch en el componente
    }
  },
  getMateriasById: async (id) => {
    try {
      const response = await axios.get(`${baseRoute}`, id);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  modifyMateriaById: async (id, body) => {
    try {
      const response = await axios.patch(`${baseRoute}/${id}`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  modifyMateria: async (id) => {
    try {
      const response = await axios.patch(`${baseRoute}/${id}/activate`);
      return response;
    } catch (error) {
      throw error; // Mejor lanzar el error para manejarlo en el componente
    }
  },
  deleteMateriaById: async (id) => {
    try {
      const response = await axios.delete(`${baseRoute}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
