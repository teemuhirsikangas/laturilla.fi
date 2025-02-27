import axios from 'axios';

export default {
  login: async (user) => {

    let res = await axios.post(`/api/user/login`, user);
    return res.data || [];
  },
  signup: async (signupRequest) => {

      if(signupRequest.user.password !== signupRequest.user.password2) {
        throw Error('Salasanat eivät ole samat');
      }
      const res = await axios.post(`/api/user/signup`, signupRequest);
      return res.data || [];
  
  },
  getUser: async () => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.get(`/api/user/me`);
    return res.data || [];
  },

  updateUser: async (user) => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.post(`/api/user/me`, user);
    return res.data || [];
  },

  //removes all data for the user, subscriptions, plates, messages etc
  deleteUserAndPlates: async (user) => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.delete(`/api/user/me`, user);
    return res.data || [];
  },

  //download userdata
  downloadData: async (user) => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.get(`/api/user/download`, user);
    return res.data || [];
  },

  changePassword: async (passwordRequest) => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.post(`/api/user/changepw`, passwordRequest);
    return res.data || [];
  },

  changeForgotPassword: async (passwordRequest) => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.post(`/api/user/changeforgotpw`, passwordRequest);
    return res.data || [];
  },

  confirmEmailAddress: async (confirmRequest) => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.post(`/api/user/emailconfirm`, confirmRequest);
    return res.data || [];
  },

  updateVehicle: async (vehicle) => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.post(`/api/user/vehicle`, vehicle);
    return res.data || [];
  },

  removeVehicle: async (id) => {

    // token header is set for logged in user in setAuthToken globally
    const res = await axios.delete(`/api/user/vehicle/${id}`);
    return res.data || [];
  }
}