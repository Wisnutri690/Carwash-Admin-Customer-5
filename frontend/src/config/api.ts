import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const url = config.url || "";
    const isCustomerEndpoint =
      url.startsWith("/customer") ||
      url.startsWith("customer") ||
      url.startsWith("/payments/snap") ||
      url.startsWith("payments/snap");

    const customerToken = localStorage.getItem("customerToken");
    const adminToken = localStorage.getItem("token");

    const token = isCustomerEndpoint
      ? (customerToken || adminToken)
      : (adminToken || customerToken);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
    (error) => {
        return Promise.reject(error);
    }
);

export default api;