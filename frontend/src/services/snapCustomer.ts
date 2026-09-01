import api from "../config/api";

export const createSnapPayment = async (orderId: number | string) => {
    const response = await api.post(`/payments/snap/${orderId}`)
    return response.data;
};