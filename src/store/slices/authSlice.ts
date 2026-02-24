import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, AuthUser, RegisterPayload, UserRole } from '../api/authApi';

// ─── Tipos ────────────────────────────────────────────────

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

// ─── Estado inicial ───────────────────────────────────────

const TOKEN_KEY = 'trampio_token';

function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

const initialState: AuthState = {
    user: null,
    token: getStoredToken(),
    isAuthenticated: false,
    loading: false,
    error: null,
};

// ─── Thunks ───────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const data = await authApi.login(email, password);
            localStorage.setItem(TOKEN_KEY, data.token);
            return data;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (payload: RegisterPayload, { rejectWithValue }) => {
        try {
            const data = await authApi.register(payload);
            localStorage.setItem(TOKEN_KEY, data.token);
            return data;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

export const fetchMeThunk = createAsyncThunk(
    'auth/me',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as { auth: AuthState };
        const token = state.auth.token;
        if (!token) return rejectWithValue('Sem token.');
        try {
            const user = await authApi.me(token);
            return user;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

// ─── Slice ────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem(TOKEN_KEY);
            }
        },
        clearError(state) {
            state.error = null;
        },
        // Usado para hidratar o state com o user vindo do /me no boot da aplicação
        setUser(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        // ── login ─────────────────────────────────────────────
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ── register ──────────────────────────────────────────
        builder
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ── fetchMe ───────────────────────────────────────────
        builder
            .addCase(fetchMeThunk.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchMeThunk.rejected, (state) => {
                // Token inválido/expirado → limpa
                state.token = null;
                state.isAuthenticated = false;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(TOKEN_KEY);
                }
            });
    },
});

export const { logout, clearError, setUser } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectRole = (state: { auth: AuthState }): UserRole | null => state.auth.user?.role ?? null;

export default authSlice.reducer;
