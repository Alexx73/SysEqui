import axios from "axios";

const baseRoute = `${import.meta.env.VITE_URL_BACK}/completadas`;
axios.defaults.withCredentials = true;

export const CompletadasAPI = {
  createCompletada: async (body) => {
    try {
      const response = await axios.post(`${baseRoute}`, body);
      return response;
    } catch (error) {
      throw error; // 🔥 Esto activa el catch en el componente
    }
  },
};
