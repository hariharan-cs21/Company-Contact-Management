import axios from "axios";

axios.defaults.withCredentials = true;
const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
});

export default apiClient;
