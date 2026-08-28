export interface LoginPayload {
    email: string;
    password: string;
}

export interface Admin {
    id: number;
    name: string;
    email: string;

}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        admin: Admin;
        token: string;
    };
}