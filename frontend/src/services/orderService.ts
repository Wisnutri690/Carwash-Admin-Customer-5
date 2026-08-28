import api from "../config/api";
import type {
    Order,
    CreateOrderPayload,
    UpdateOrderStatusPayload,
    UpdateOrderPaymentPayload,
    OrderResponse,
    SingleOrderResponse
} from "../types/order";

export const getOrders = async (): Promise<Order[]> => {
    const response = await api.get<OrderResponse>("/orders");
    return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getOrderById = async (id: string | number): Promise<Order> => {
    const response = await api.get<SingleOrderResponse>(`/orders/${id}`);
    return response.data.data;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
    const response = await api.post<SingleOrderResponse>("/orders", payload);
    return response.data.data;
};

export const updateOrderStatus = async (id: string | number, payload: UpdateOrderStatusPayload): Promise<Order> => {
    const response = await api.put<SingleOrderResponse>(`/orders/${id}`, payload);
    return response.data.data;
};

export const updateOrder = async (id: string | number, payload: any): Promise<Order> => {
    const response = await api.put<SingleOrderResponse>(`/orders/${id}`, payload);
    return response.data.data;
};

export const updateOrderPayment = async (id: string | number, payload: UpdateOrderPaymentPayload): Promise<Order> => {
    const response = await api.post<SingleOrderResponse>(`/orders/${id}/payment`, payload);
    return response.data.data;
};

export const deleteOrder = async (id: string | number): Promise<void> => {
    await api.delete(`/orders/${id}`);
};

export const getOrderInvoice = async (id: string | number): Promise<any> => {
    const response = await api.get(`/orders/${id}/invoice`);
    return response.data.data;
};
