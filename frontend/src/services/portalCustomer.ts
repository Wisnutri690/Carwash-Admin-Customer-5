import api from "../config/api";
import type { CustomerCreateOrderPayload, Order } from "../types/order";
import type { Service } from "../types/service";
import type { Vehicle } from "../types/vehicle";

export const getPublicServices = async (): Promise<Service[]> => {
  const response = await api.get<{ success: boolean; data: Service[] }>("/services");
  return response.data.data;
};

export const customerLogin = async (email: string) => {
  const response = await api.post("/auth/customer/login", { email });
  return response.data;
};

export const customerRegister = async (payload: { name: string; email: string; phone: string }) => {
  const response = await api.post("/auth/customer/register", payload);
  return response.data;
};

export const getMyVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get<{ success: boolean; data: Vehicle[] }>("/customer/vehicles");
  return response.data.data;
};

export const addMyvehicles = async (payload: {
  plateNumber: string;
  brand: string;
  model: string;
  color: string;
  year?: number;
}) => {
  const response = await api.post("/customer/vehicles", payload);
  return response.data;
};

export const updateMyVehicle = async (
  id: number | string,
  payload: {
    plateNumber?: string;
    brand?: string;
    model?: string;
    color?: string;
    year?: number;
  }
) => {
  const response = await api.put(`/customer/vehicles/${id}`, payload);
  return response.data;
};

export const deleteMyVehicle = async (id: number | string) => {
  const response = await api.delete(`/customer/vehicles/${id}`);
  return response.data;
};

export const createCustomerOrder = async (payload: CustomerCreateOrderPayload) => {
  const response = await api.post("/customer/orders", payload);
  return response.data;
};

export const getMyActiveOrders = async (): Promise<any[]> => {
  const response = await api.get<{ success: boolean; data: any[] }>("/customer/orders/active");
  return response.data.data;
};

export const getMyOrderHistory = async (): Promise<Order[]> => {
  const response = await api.get<{ success: boolean; data: Order[] }>("/customer/orders/history");
  return response.data.data;
};

export const cancelMyOrder = async (orderId: number | string) => {
  const response = await api.patch(`/customer/orders/${orderId}/cancel`);
  return response.data;
};

export const getMyProfile = async (): Promise<any> => {
  const response = await api.get<{ success: boolean; data: any }>("/customer/profile");
  return response.data.data;
};

export const updateMyProfile = async (payload: { name?: string; phone?: string }) => {
  const response = await api.put("/customer/profile", payload);
  return response.data;
};
