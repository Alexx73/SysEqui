import axios from "axios";

const baseRoute = `${import.meta.env.VITE_URL_BACK}/avisos`;
axios.defaults.withCredentials = true;

const request = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    return error.response || { status: 0, data: { error: "No se pudo conectar con el servidor" } };
  }
};

export const AvisosAPI = {
  getAvisos: () => request(() => axios.get(baseRoute)),
  createAviso: (body) => request(() => axios.post(baseRoute, body)),
  updateAviso: (id, body) => request(() => axios.patch(`${baseRoute}/${id}`, body)),
  deleteAviso: (id) => request(() => axios.delete(`${baseRoute}/${id}`)),
};
