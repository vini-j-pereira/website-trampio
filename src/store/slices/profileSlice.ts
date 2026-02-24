import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi, ProfileData } from '../api/api';

interface ProfileState {
    data: ProfileData | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProfileState = {
    data: null,
    loading: false,
    error: null,
};

// ─── Thunks ───────────────────────────────────────────────

export const fetchProfileThunk = createAsyncThunk(
    'profile/fetch',
    async (_, { rejectWithValue }) => {
        try {
            return await profileApi.get();
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

export const updateProfileThunk = createAsyncThunk(
    'profile/update',
    async (body: Partial<Record<string, unknown>>, { rejectWithValue }) => {
        try {
            await profileApi.update(body);
            // Fetch fresh data after update
            return await profileApi.get();
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

// ─── Slice ────────────────────────────────────────────────

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfileError(state) { state.error = null; },
        resetProfile(state) { state.data = null; state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfileThunk.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchProfileThunk.fulfilled, (state, action) => {
                state.loading = false; state.data = action.payload;
            })
            .addCase(fetchProfileThunk.rejected, (state, action) => {
                state.loading = false; state.error = action.payload as string;
            });

        builder
            .addCase(updateProfileThunk.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(updateProfileThunk.fulfilled, (state, action) => {
                state.loading = false; state.data = action.payload;
            })
            .addCase(updateProfileThunk.rejected, (state, action) => {
                state.loading = false; state.error = action.payload as string;
            });
    },
});

export const { clearProfileError, resetProfile } = profileSlice.actions;
export const selectProfile = (s: { profile: ProfileState }) => s.profile;
export default profileSlice.reducer;
