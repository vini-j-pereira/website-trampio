/**
 * useCep — ViaCEP hook for Brazilian ZIP auto-fill
 * Usage: const { cepValue, setCep, address, loading, error } = useCep();
 */
import { useState, useCallback } from 'react';

export interface CepAddress {
    cep: string;
    street: string;      // logradouro
    complement: string;  // complemento
    neighborhood: string;// bairro
    city: string;        // localidade
    state: string;       // uf
    ibge: string;
    ddd: string;
}

interface UseCepReturn {
    cepValue: string;
    setCep: (raw: string) => void;
    address: CepAddress | null;
    loading: boolean;
    error: string;
    clearAddress: () => void;
}

export function useCep(onFound?: (addr: CepAddress) => void): UseCepReturn {
    const [cepValue, setCepValue] = useState('');
    const [address, setAddress] = useState<CepAddress | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatCep = (raw: string) =>
        raw.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');

    const lookup = useCallback(async (digits: string) => {
        if (digits.length < 8) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            const data = await res.json();
            if (data.erro) {
                setError('CEP não encontrado.');
                setAddress(null);
                return;
            }
            const addr: CepAddress = {
                cep: data.cep,
                street: data.logradouro ?? '',
                complement: data.complemento ?? '',
                neighborhood: data.bairro ?? '',
                city: data.localidade ?? '',
                state: data.uf ?? '',
                ibge: data.ibge ?? '',
                ddd: data.ddd ?? '',
            };
            setAddress(addr);
            onFound?.(addr);
        } catch {
            setError('Erro ao buscar CEP.');
            setAddress(null);
        } finally {
            setLoading(false);
        }
    }, [onFound]);

    const setCep = useCallback((raw: string) => {
        const formatted = formatCep(raw);
        setCepValue(formatted);
        const digits = formatted.replace(/\D/g, '');
        if (digits.length === 8) lookup(digits);
        if (digits.length < 8) { setAddress(null); setError(''); }
    }, [lookup]);

    const clearAddress = useCallback(() => {
        setCepValue('');
        setAddress(null);
        setError('');
    }, []);

    return { cepValue, setCep, address, loading, error, clearAddress };
}
