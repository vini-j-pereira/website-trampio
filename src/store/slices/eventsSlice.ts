import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventsApi, CalendarEventData, CreateEventPayload, UpdateEventPayload } from '../api/api';

interface EventsState {
    items: CalendarEventData[];
    loading: boolean;
    error: string | null;
}

const initialState: EventsState = { items: [], loading: false, error: null };

// ─── Thunks ───────────────────────────────────────────────

export const fetchEventsThunk = createAsyncThunk(
    'events/fetch',
    async ({ month, year }: { month?: number; year?: number } = {}, { rejectWithValue }) => {
        try { return await eventsApi.list(month, year); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const createEventThunk = createAsyncThunk(
    'events/create',
    async (body: CreateEventPayload, { rejectWithValue }) => {
        try { return await eventsApi.create(body); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const updateEventThunk = createAsyncThunk(
    'events/update',
    async ({ id, body }: { id: string; body: UpdateEventPayload }, { rejectWithValue }) => {
        try { return await eventsApi.update(id, body); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const deleteEventThunk = createAsyncThunk(
    'events/delete',
    async (id: string, { rejectWithValue }) => {
        try { await eventsApi.delete(id); return id; }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

// ─── Slice ────────────────────────────────────────────────

const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        clearEventsError(state) { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEventsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchEventsThunk.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
            .addCase(fetchEventsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder
            .addCase(createEventThunk.fulfilled, (state, action) => { state.items.push(action.payload); })
            .addCase(createEventThunk.rejected, (state, action) => { state.error = action.payload as string; });

        builder
            .addCase(updateEventThunk.fulfilled, (state, action) => {
                const idx = state.items.findIndex(e => e.id === action.payload.id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(updateEventThunk.rejected, (state, action) => { state.error = action.payload as string; });

        builder
            .addCase(deleteEventThunk.fulfilled, (state, action) => {
                state.items = state.items.filter(e => e.id !== action.payload);
            })
            .addCase(deleteEventThunk.rejected, (state, action) => { state.error = action.payload as string; });
    },
});

export const { clearEventsError } = eventsSlice.actions;
export const selectEvents = (s: { events: EventsState }) => s.events;
export default eventsSlice.reducer;
