import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    requestsApi,
    ServiceRequestData,
    CreateRequestPayload,
    UpdateRequestPayload,
} from '../api/api';

interface RequestsState {
    items: ServiceRequestData[];
    loading: boolean;
    error: string | null;
}

const initialState: RequestsState = { items: [], loading: false, error: null };

// ─── Thunks ───────────────────────────────────────────────

export const fetchRequestsThunk = createAsyncThunk(
    'requests/fetch',
    async (_, { rejectWithValue }) => {
        try { return await requestsApi.list(); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const createRequestThunk = createAsyncThunk(
    'requests/create',
    async (body: CreateRequestPayload, { rejectWithValue }) => {
        try { return await requestsApi.create(body); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const updateRequestThunk = createAsyncThunk(
    'requests/update',
    async ({ id, body }: { id: string; body: UpdateRequestPayload }, { rejectWithValue }) => {
        try { return await requestsApi.update(id, body); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const deleteRequestThunk = createAsyncThunk(
    'requests/delete',
    async (id: string, { rejectWithValue }) => {
        try { await requestsApi.delete(id); return id; }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

// ─── Slice ────────────────────────────────────────────────

const requestsSlice = createSlice({
    name: 'requests',
    initialState,
    reducers: {
        clearRequestsError(state) { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRequestsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchRequestsThunk.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
            .addCase(fetchRequestsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder
            .addCase(createRequestThunk.fulfilled, (state, action) => { state.items.unshift(action.payload); })
            .addCase(createRequestThunk.rejected, (state, action) => { state.error = action.payload as string; });

        builder
            .addCase(updateRequestThunk.fulfilled, (state, action) => {
                const idx = state.items.findIndex(r => r.id === action.payload.id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(updateRequestThunk.rejected, (state, action) => { state.error = action.payload as string; });

        builder
            .addCase(deleteRequestThunk.fulfilled, (state, action) => {
                state.items = state.items.filter(r => r.id !== action.payload);
            })
            .addCase(deleteRequestThunk.rejected, (state, action) => { state.error = action.payload as string; });
    },
});

export const { clearRequestsError } = requestsSlice.actions;
export const selectRequests = (s: { requests: RequestsState }) => s.requests;
export default requestsSlice.reducer;
