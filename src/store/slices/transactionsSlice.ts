import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    transactionsApi,
    TransactionData,
    CreateTransactionPayload,
    UpdateTransactionPayload,
} from '../api/api';

interface TransactionsState {
    items: TransactionData[];
    loading: boolean;
    error: string | null;
}

const initialState: TransactionsState = { items: [], loading: false, error: null };

// ─── Thunks ───────────────────────────────────────────────

export const fetchTransactionsThunk = createAsyncThunk(
    'transactions/fetch',
    async ({ month, year }: { month?: number; year?: number } = {}, { rejectWithValue }) => {
        try { return await transactionsApi.list(month, year); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const createTransactionThunk = createAsyncThunk(
    'transactions/create',
    async (body: CreateTransactionPayload, { rejectWithValue }) => {
        try { return await transactionsApi.create(body); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const updateTransactionThunk = createAsyncThunk(
    'transactions/update',
    async ({ id, body }: { id: string; body: UpdateTransactionPayload }, { rejectWithValue }) => {
        try { return await transactionsApi.update(id, body); }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

export const deleteTransactionThunk = createAsyncThunk(
    'transactions/delete',
    async (id: string, { rejectWithValue }) => {
        try { await transactionsApi.delete(id); return id; }
        catch (err) { return rejectWithValue((err as Error).message); }
    }
);

// ─── Slice ────────────────────────────────────────────────

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        clearTransactionsError(state) { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactionsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTransactionsThunk.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
            .addCase(fetchTransactionsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder
            .addCase(createTransactionThunk.fulfilled, (state, action) => { state.items.unshift(action.payload); })
            .addCase(createTransactionThunk.rejected, (state, action) => { state.error = action.payload as string; });

        builder
            .addCase(updateTransactionThunk.fulfilled, (state, action) => {
                const idx = state.items.findIndex(t => t.id === action.payload.id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(updateTransactionThunk.rejected, (state, action) => { state.error = action.payload as string; });

        builder
            .addCase(deleteTransactionThunk.fulfilled, (state, action) => {
                state.items = state.items.filter(t => t.id !== action.payload);
            })
            .addCase(deleteTransactionThunk.rejected, (state, action) => { state.error = action.payload as string; });
    },
});

export const { clearTransactionsError } = transactionsSlice.actions;
export const selectTransactions = (s: { transactions: TransactionsState }) => s.transactions;
export default transactionsSlice.reducer;
