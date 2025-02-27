import axios from 'axios';

export default {
  sendMessage: async (message) => {
    let res = await axios.post(`/api/messages`, message);
    return res.data || [];
  },
  sendMessageAnon: async (message) => {
    let res = await axios.post(`/api/messages/anon`, message);
    return res.data || [];
  },
  replyMessage: async (message) => {
    let res = await axios.post(`/api/messages/reply`, message);
    return res.data || [];
  },
  // get messages for the logged in user
  // token header is set for logged in user in setAuthToken globally
  getMessages: async () => {
    let res = await axios.get(`/api/messages/`);
    return res.data || [];
  },
  deleteMessage: async (id) => {
    // token header is set for logged in user in setAuthToken globally
    const res = await axios.delete(`/api/messages/${id}`);
    return res.data || [];
  },
  sendResetEmail: async (emailEnvelope) => {
    let res = await axios.post(`/api/email/reset`, emailEnvelope);
    return res.data || [];
  },
  sendOnboardEmail: async (emailEnvelope) => {
    let res = await axios.post(`/api/email/onboard`, emailEnvelope);
    return res.data || [];
  },
  sendFeedbackEmail: async (emailEnvelope) => {
    let res = await axios.post(`/api/email/feedback`, emailEnvelope);
    return res.data || [];
  },
  getEmailUuid: async (uuid) => {
    let res = await axios.get(`/api/email/${uuid}`);
    return res.data || [];
  }
}