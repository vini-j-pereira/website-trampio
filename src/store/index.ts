import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import eventsReducer from './slices/eventsSlice';
import transactionsReducer from './slices/transactionsSlice';
import requestsReducer from './slices/requestsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        events: eventsReducer,
        transactions: transactionsReducer,
        requests: requestsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // evita warnings com Date objects
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
