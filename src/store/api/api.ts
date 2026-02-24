/**
 * Shared HTTP client for all authenticated API calls.
 * Uses the Redux store token from localStorage.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const TOKEN_KEY = 'trampio_token';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function req<T>(
    path: string,
    method: Method = 'GET',
    body?: unknown
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // 204 No Content
    if (res.status === 204) return undefined as T;

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
    return data as T;
}

// ─── Profile ──────────────────────────────────────────────

export interface ProfileData {
    id: string;
    email: string;
    role: 'CLIENT_CPF' | 'CLIENT_CNPJ' | 'PROVIDER';
    created_at: string;
    clientProfile?: {
        id: string;
        name: string;
        cpf?: string;
        avatar_url?: string;
        cep?: string;
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        location?: string;
    };
    condoProfile?: {
        id: string;
        name: string;
        cnpj?: string;
        address?: string;
        avatar_url?: string;
        city?: string;
        state?: string;
    };
    providerProfile?: {
        id: string;
        name: string;
        bio?: string;
        area: string;
        radius_km: number;
        experience_yrs: number;
        avatar_url?: string;
        city?: string;
        state?: string;
        availability: 'AVAILABLE' | 'BUSY' | 'VACATION';
        rating: number;
        rating_count: number;
        week_goal?: number;
        month_goal?: number;
        document_type: 'CPF' | 'CNPJ';
        company_name?: string;
    };
}

export const profileApi = {
    get: () => req<ProfileData>('/profile'),
    update: (body: Partial<Record<string, unknown>>) =>
        req<unknown>('/profile', 'PATCH', body),
};

// ─── Calendar Events ──────────────────────────────────────

export interface CalendarEventData {
    id: string;
    provider_id: string;
    title: string;
    client?: string;
    description?: string;
    day: number;
    month: number;
    year: number;
    time: string;
    reminder?: string;
    is_reminder: boolean;
    earnings?: number;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'DONE';
}

export type CreateEventPayload = Omit<CalendarEventData, 'id' | 'provider_id'>;
export type UpdateEventPayload = Partial<CreateEventPayload>;

export const eventsApi = {
    list: (month?: number, year?: number) => {
        const params = new URLSearchParams();
        if (month) params.set('month', String(month));
        if (year) params.set('year', String(year));
        const qs = params.toString();
        return req<CalendarEventData[]>(`/events${qs ? `?${qs}` : ''}`);
    },
    create: (body: CreateEventPayload) =>
        req<CalendarEventData>('/events', 'POST', body),
    update: (id: string, body: UpdateEventPayload) =>
        req<CalendarEventData>(`/events/${id}`, 'PATCH', body),
    delete: (id: string) =>
        req<void>(`/events/${id}`, 'DELETE'),
};

// ─── Transactions ─────────────────────────────────────────

export interface TransactionData {
    id: string;
    provider_id: string;
    type: 'INCOME' | 'EXPENSE' | 'RECEIVABLE';
    value: number;
    date: string;
    description: string;
    category: string;
    calendar_event_id?: string;
}

export type CreateTransactionPayload = Omit<TransactionData, 'id' | 'provider_id'>;
export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export const transactionsApi = {
    list: (month?: number, year?: number) => {
        const params = new URLSearchParams();
        if (month) params.set('month', String(month));
        if (year) params.set('year', String(year));
        const qs = params.toString();
        return req<TransactionData[]>(`/transactions${qs ? `?${qs}` : ''}`);
    },
    create: (body: CreateTransactionPayload) =>
        req<TransactionData>('/transactions', 'POST', body),
    update: (id: string, body: UpdateTransactionPayload) =>
        req<TransactionData>(`/transactions/${id}`, 'PATCH', body),
    delete: (id: string) =>
        req<void>(`/transactions/${id}`, 'DELETE'),
};

// ─── Service Requests ─────────────────────────────────────

export interface ProfessionalSlot {
    request_id: string;
    profession: string;
}

export interface ServiceRequestData {
    id: string;
    client_id: string;
    title: string;
    description: string;
    urgency: 'URGENTE' | 'NORMAL' | 'FLEXIVEL';
    photo_url?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
    created_at: string;
    professionals: ProfessionalSlot[];
}

export interface CreateRequestPayload {
    title: string;
    description: string;
    urgency: 'URGENTE' | 'NORMAL' | 'FLEXIVEL';
    photo_url?: string;
    professionals?: string[];
}

export interface UpdateRequestPayload {
    title?: string;
    description?: string;
    urgency?: 'URGENTE' | 'NORMAL' | 'FLEXIVEL';
    status?: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
    photo_url?: string;
    professionals?: string[];
}

export const requestsApi = {
    list: () => req<ServiceRequestData[]>('/requests'),
    create: (body: CreateRequestPayload) =>
        req<ServiceRequestData>('/requests', 'POST', body),
    update: (id: string, body: UpdateRequestPayload) =>
        req<ServiceRequestData>(`/requests/${id}`, 'PATCH', body),
    delete: (id: string) =>
        req<void>(`/requests/${id}`, 'DELETE'),
};

// ─── Password Recovery ────────────────────────────────────

export const passwordApi = {
    forgot: (email: string) =>
        req<{ message: string }>('/password/forgot', 'POST', { email }),
    reset: (token: string, password: string) =>
        req<{ message: string }>('/password/reset', 'POST', { token, password }),
};

// ─── Provider Search ──────────────────────────────────────

export interface ProviderSearchResult {
    id: string;
    user_id: string;
    name: string;
    area: string;
    bio?: string;
    avatar_url?: string;
    city?: string;
    state?: string;
    rating: number;
    rating_count: number;
    experience_yrs: number;
    availability: 'AVAILABLE' | 'BUSY' | 'VACATION';
    radius_km: number;
}

export const searchApi = {
    providers: (params: {
        q?: string;
        area?: string;
        city?: string;
        state?: string;
        availability?: string;
    }) => {
        const qs = new URLSearchParams();
        if (params.q) qs.set('q', params.q);
        if (params.area && params.area !== 'todos') qs.set('area', params.area);
        if (params.city) qs.set('city', params.city);
        if (params.state) qs.set('state', params.state);
        if (params.availability) qs.set('availability', params.availability);
        const query = qs.toString();
        return req<ProviderSearchResult[]>(`/search/providers${query ? `?${query}` : ''}`);
    },
    requests: (params?: { q?: string; urgency?: string; area?: string; city?: string; state?: string; scope?: 'city' | 'state' | 'country' }) => {
        const qs = new URLSearchParams();
        if (params?.q) qs.set('q', params.q);
        if (params?.urgency) qs.set('urgency', params.urgency);
        if (params?.area) qs.set('area', params.area);
        if (params?.city) qs.set('city', params.city);
        if (params?.state) qs.set('state', params.state);
        if (params?.scope) qs.set('scope', params.scope);
        const query = qs.toString();
        return req<OpenServiceRequest[]>(`/search/requests${query ? `?${query}` : ''}`);
    },
};

export interface OpenServiceRequest {
    id: string;
    client_id: string;
    title: string;
    description: string;
    urgency: 'URGENTE' | 'NORMAL' | 'FLEXIVEL';
    photo_url?: string;
    status: string;
    created_at: string;
    client?: {
        name: string;
        city?: string;
        state?: string;
        neighborhood?: string;
        avatar_url?: string;
    };
}


