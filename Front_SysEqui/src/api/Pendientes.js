import axios from "axios";

const baseRoute = `${import.meta.env.VITE_URL_BACK}/pendientes`;
axios.defaults.withCredentials = true;

export const PendientesAPI = {
  getPendientesAll: async () => {
    try {
      const response = await axios.get(`${baseRoute}`);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  createPendiente: async (body) => {
    try {
      const response = await axios.post(`${baseRoute}`, body);
      return response;
    } catch (error) {
      throw error; // 🔥 Esto activa el catch en el componente
    }
  },
  deletePendiente: async (id) => {
    try {
      const response = await axios.delete(`${baseRoute}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
