'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { fetchMeThunk } from '@/store/slices/authSlice';

// Hidrata o Redux store verificando o token salvo no localStorage ao carregar a app
function StoreHydrator({ children }: { children: React.ReactNode }) {
    const hydrated = useRef(false);

    useEffect(() => {
        if (hydrated.current) return;
        hydrated.current = true;

        const token = localStorage.getItem('trampio_token');
        if (token) {
            // Dispara fetchMe para validar o token e popular o user no store
            store.dispatch(fetchMeThunk());
        }
    }, []);

    return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <StoreHydrator>{children}</StoreHydrator>
        </Provider>
    );
}
