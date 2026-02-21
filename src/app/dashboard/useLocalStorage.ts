import { useState, useEffect, useCallback } from "react"

/**
 * useLocalStorage — persiste estado no localStorage do navegador.
 * Hidrata o estado inicial a partir do localStorage (se disponível)
 * e sincroniza qualquer atualização de volta automaticamente.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue
        try {
            const item = window.localStorage.getItem(key)
            return item ? (JSON.parse(item) as T) : initialValue
        } catch {
            return initialValue
        }
    })

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setStoredValue(prev => {
            const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value
            try {
                window.localStorage.setItem(key, JSON.stringify(next))
            } catch {
                // quota exceeded ou SSR — ignora silenciosamente
            }
            return next
        })
    }, [key])

    // Sincroniza entre abas/janelas do mesmo navegador
    useEffect(() => {
        function handleStorage(e: StorageEvent) {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue) as T)
                } catch {
                    // ignore
                }
            }
        }
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [key])

    return [storedValue, setValue]
}
