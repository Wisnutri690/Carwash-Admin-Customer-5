import api from "../config/api";
import type {
    Service,
    CreateServicePayload,
    UpdateServicePayload,
    ServiceResponse
} from "../types/service";

export const getServices = async (): Promise<Service[]> => {
    const response = await api.get<ServiceResponse>("/services");
    return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getServiceById = async (id: string | number): Promise<Service> => {
    const response = await api.get<ServiceResponse>(`/services/${id}`);
    return response.data.data as Service;
};

export const createService = async (payload: CreateServicePayload): Promise<Service> => {
    const response = await api.post<ServiceResponse>("/services", payload);
    return response.data.data as Service;
};

export const updateService = async (id: string | number, payload: UpdateServicePayload): Promise<Service> => {
    const response = await api.put<ServiceResponse>(`/services/${id}`, payload);
    return response.data.data as Service;
};

export const deleteService = async (id: string | number): Promise<void> => {
    await api.delete(`/services/${id}`);
};
