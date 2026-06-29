import axios from "axios";

const baseRoute = `${import.meta.env.VITE_URL_BACK}/cursos`;
axios.defaults.withCredentials = true;

export const CursosAPI = {
  getAllCursos: async () => {
    try {
      const response = await axios.get(`${baseRoute}`);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  modifyCursoById: async (id, body) => {
    try {
      const response = await axios.patch(`${baseRoute}/${id}`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  createCurso: async (body) => {
    try {
      const response = await axios.post(`${baseRoute}`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  assignNote: async (id, body) => {
    try {
      const response = await axios.patch(`${baseRoute}/assignNote/${id}`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  //   getStaffByRole: async (role) => {
  //     try {
  //       const response = await axios.get(`${baseRoute}/staff:role`);
  //       return response;
  //     } catch (error) {
  //       return error.response;
  //     }
  //   },
};
