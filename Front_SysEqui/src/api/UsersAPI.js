import axios from "axios";

const baseRoute = `${import.meta.env.VITE_URL_BACK}/users`;
axios.defaults.withCredentials = true;

export const UsersAPI = {
  login: async (body) => {
    try {
      const response = await axios.post(`${baseRoute}/login`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  register: async (body) => {
    try {
      const response = await axios.post(`${baseRoute}/register`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  getAllStaff: async () => {
    try {
      const response = await axios.get(`${baseRoute}/staff`);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  getStaffByRole: async (role) => {
    try {
      const response = await axios.get(`${baseRoute}/staff:role`);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  createStaff: async (body) => {
    try {
      const response = await axios.post(`${baseRoute}/createstaff`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  activateEstado: async (id) => {
    try {
      const response = await axios.post(`${baseRoute}/active/${id}`);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  deactivateEstado: async (id) => {
    try {
      const response = await axios.post(`${baseRoute}/deactive/${id}`);
      return response;
    } catch (error) {
      return error.response;
    }
  },

  getOwnProfile: async () => {
    try {
      const response = await axios.get(`${baseRoute}/profile`);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  logout: async () => {
    try {
      const response = await axios.post(`${baseRoute}/logout`);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  updateOwnProfile: async (body) => {
    try {
      const response = await axios.patch(`${baseRoute}/profile`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  getUnauthUsers: async () => {
    try {
      const response = await axios.get(`${baseRoute}/unauth`);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  getUsersByDni: async (dni) => {
    try {
      const response = await axios.get(`${baseRoute}/${dni}`);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  updateUserProfileByDni: async (dni, body) => {
    try {
      const response = await axios.patch(`${baseRoute}/${dni}`, body);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${baseRoute}`);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  validateUser: async (id) => {
    try {
      const response = await axios.post(`${baseRoute}/unauth`, id);
      return response;
    } catch (error) {
      return error.response;
    }
  },
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${baseRoute}`, id);
      return response;
    } catch (error) {
      return error.response;
    }
  },
};
