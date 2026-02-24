// URL base do backend — ajuste conforme o host em produção
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

type RequestOptions = {
    method?: string;
    body?: unknown;
    token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error ?? `HTTP ${res.status}`);
    }

    return data as T;
}

// ─── Auth endpoints ───────────────────────────────────────

export type UserRole = 'CLIENT_CPF' | 'CLIENT_CNPJ' | 'PROVIDER';

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export interface RegisterClientCpfPayload {
    role: 'CLIENT_CPF';
    email: string;
    password: string;
    name: string;
    cpf?: string;
    city?: string;
    state?: string;
}

export interface RegisterClientCnpjPayload {
    role: 'CLIENT_CNPJ';
    email: string;
    password: string;
    name: string;
    cnpj?: string;
    address?: string;
    city?: string;
    state?: string;
}

export interface RegisterProviderPayload {
    role: 'PROVIDER';
    email: string;
    password: string;
    name: string;
    document_type?: 'CPF' | 'CNPJ';
    document?: string;
    company_name?: string;
    bio?: string;
    area: string;
    radius_km?: number;
    experience_yrs?: number;
    city?: string;
    state?: string;
}

export type RegisterPayload =
    | RegisterClientCpfPayload
    | RegisterClientCnpjPayload
    | RegisterProviderPayload;

export const authApi = {
    login: (email: string, password: string) =>
        request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),

    register: (payload: RegisterPayload) =>
        request<AuthResponse>('/auth/register', { method: 'POST', body: payload }),

    me: (token: string) =>
        request<AuthUser>('/auth/me', { token }),
};
