import api from "../config/api";
import type { LoginPayload, AuthResponse } from "../types/auth";

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {

    const response = await api.post<AuthResponse>("/auth/login", payload);

    return response.data
}