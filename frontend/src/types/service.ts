export interface Service {
    id: string | number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateServicePayload {
    name: string;
    description?: string;
    price: number;
    duration: number;
    isActive?: boolean;
}

export interface UpdateServicePayload {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    isActive?: boolean;
}

export interface ServiceResponse {
    success: boolean;
    message: string;
    data: Service | Service[];
}
