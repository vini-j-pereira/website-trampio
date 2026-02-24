import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // Novos slices serão adicionados aqui nas próximas fases:
        // providers: providersReducer,
        // calendar: calendarReducer,
        // finance: financeReducer,
        // condo: condoReducer,
        // chat: chatReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // evita warnings com Date objects
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
