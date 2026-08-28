import api from "../config/api";
import type {
    Staff, CreateStaffPayload, UpdateStaffPayload, StaffResponse
} from "../types/staff";

export const getStaffs = async (): Promise<Staff[]> => {
    const response = await api.get<StaffResponse>("/staff");
    return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getStaffById = async (id: string | number): Promise<Staff> => {
    const response = await api.get<StaffResponse>(`/staff/${id}`);
    return response.data.data as Staff;
};

export const createStaff = async (payload: CreateStaffPayload): Promise<Staff> => {
    const response = await api.post<StaffResponse>("/staff", payload);
    return response.data.data as Staff;
};

export const updateStaff = async (id: string | number, payload: UpdateStaffPayload): Promise<Staff> => {
    const response = await api.patch<StaffResponse>(`/staff/${id}`, payload);
    return response.data.data as Staff;
};

export const deleteStaff = async (id: string | number): Promise<void> => {
    await api.delete(`/staff/${id}`);
};
