import api from "../config/api";
import type {
    Vehicle,
    CreateVehiclePayload,
    UpdateVehiclePayload,
    VehicleResponse
} from "../types/vehicle";

export const getVehicles = async (): Promise<Vehicle[]> => {
    const response = await api.get<VehicleResponse>("/vehicles");
    return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getVehicleById = async (id: string | number): Promise<Vehicle> => {
    const response = await api.get<VehicleResponse>(`/vehicles/${id}`);
    return response.data.data as Vehicle;
};

export const createVehicle = async (payload: CreateVehiclePayload): Promise<Vehicle> => {
    const response = await api.post<VehicleResponse>("/vehicles", payload);
    return response.data.data as Vehicle;
};


export const updateVehicle = async (id: string | number, payload: UpdateVehiclePayload): Promise<Vehicle> => {
    const response = await api.put<VehicleResponse>(`/vehicles/${id}`, payload);
    return response.data.data as Vehicle;
};

export const deleteVehicle = async (id: string | number): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
};
