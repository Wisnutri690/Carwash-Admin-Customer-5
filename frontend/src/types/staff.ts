export interface Staff {
    id: string | number;
    name: string;
    phone?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateStaffPayload {
    name: string;
    phone?: string;
    isActive?: boolean;
}

export interface UpdateStaffPayload {
    name?: string;
    phone?: string;
    isActive?: boolean;
}

export interface StaffResponse {
    success: boolean;
    message: string;
    data: Staff | Staff[];
}
