import axios from 'axios';

export default {
  subscribe: async (subscription, platform, userAgent) => {
    const subsData = {
      subscription,
      platform,
      userAgent
    };

    let res = await axios.post(`/api/push/register`, subsData);
    return res.data || [];
  },
  getSubscriptions: async () => {
    let res = await axios.get(`/api/push`);
    return res.data || [];
  },
  getSubscriptionForUser: async (subscription) => {
    let res = await axios.post(`/api/push/subscription`, subscription);
    return res.data || [];
  },
  sendTestPush: async (message) => {
    //message not yet used, uses static message in the api side
    let res = await axios.post(`/api/messages/test`, message);
    return res.data || [];
  },  
  sendPush: async (messageEnvelope) => {
    let res = await axios.post(`/api/push/send`, messageEnvelope);
    return res.data || [];
  },
  unsubscribe: async (subscription) => {
    let res = await axios.post(`/api/push/unregister`, subscription);
    return res.data || [];
  },
  removeSubscriptionWithId: async (id) => {
    let res = await axios.delete(`/api/push/${id}`);
    return res.data || [];
  }
}