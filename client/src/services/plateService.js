import axios from 'axios';

export default {
  getAll: async () => {
    let res = await axios.get(`/api/plate`);
    return res.data || [];
  },
  getPlate: async (plate) => {
    let res = await axios.get(`/api/plate/${plate}`);
    return res.data || [];
  }
}