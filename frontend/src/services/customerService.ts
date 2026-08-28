import api from "../config/api";
import type {
    Customer, CreateCustomerPayload,
    UpdateCustomerPayload, CustomerResponse
} from "../types/customer";

export const getCustomer = async (): Promise<Customer[]> => {
    const response = await api.get<CustomerResponse>("/customers");

    return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getCustomerById = async (id: string): Promise<Customer> => {
    const response = await api.get<CustomerResponse>(`/customers/${id}`);

    return response.data.data as Customer;
};

export const createCustomer = async (payload: CreateCustomerPayload): Promise<Customer> => {

    const response = await api.post<CustomerResponse>("/customers", payload);

    return response.data.data as Customer;
};

export const updateCustomer = async (id: string, payload: UpdateCustomerPayload): Promise<Customer> => {

    const response = await api.put<CustomerResponse>(`/customers/${id}`, payload);

    return response.data.data as Customer;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
};