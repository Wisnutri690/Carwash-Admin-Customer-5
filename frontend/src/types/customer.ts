export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCustomerPayload {
    name: string;
    phone: string;
    email?: string;
    address?: string;
}

export interface UpdateCustomerPayload {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface CustomerResponse {
    success: boolean;
    message: string;
    data: Customer | Customer[];
}