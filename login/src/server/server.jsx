import axios from "axios";

const api = axios.create({
  baseURL: "https://login-2-zbeb.onrender.com/",
  withCredentials: true,
});

export default api;
