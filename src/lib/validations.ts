/**
 * Frontend validation utilities
 * CPF, CNPJ, phone, email, password strength
 */

// ── CPF ────────────────────────────────────────────────────
export function validateCPF(cpf: string): boolean {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false; // all same digits

    const calc = (len: number) => {
        let sum = 0;
        for (let i = 0; i < len; i++) {
            sum += parseInt(digits[i]) * (len + 1 - i);
        }
        const rest = (sum * 10) % 11;
        return rest >= 10 ? 0 : rest;
    };

    return calc(9) === parseInt(digits[9]) && calc(10) === parseInt(digits[10]);
}

export function formatCPF(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 11);
    return d
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// ── CNPJ ───────────────────────────────────────────────────
export function validateCNPJ(cnpj: string): boolean {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    const calc = (len: number) => {
        let sum = 0;
        let pos = len - 7;
        for (let i = len; i >= 1; i--) {
            sum += parseInt(digits[len - i]) * pos--;
            if (pos < 2) pos = 9;
        }
        return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };

    return calc(12) === parseInt(digits[12]) && calc(13) === parseInt(digits[13]);
}

export function formatCNPJ(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 14);
    return d
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// ── Phone ──────────────────────────────────────────────────
export function validatePhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    // Accept 10 (landline) or 11 (mobile) digits
    return digits.length === 10 || digits.length === 11;
}

export function formatPhone(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 10) {
        return d
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return d
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

// ── Email ──────────────────────────────────────────────────
export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Password strength ──────────────────────────────────────
export type PasswordStrength = 'weak' | 'medium' | 'strong';

export function getPasswordStrength(password: string): PasswordStrength {
    if (password.length < 6) return 'weak';
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (password.length >= 10 && score >= 3) return 'strong';
    if (password.length >= 6 && score >= 2) return 'medium';
    return 'weak';
}

export const passwordStrengthLabel: Record<PasswordStrength, string> = {
    weak: 'Fraca',
    medium: 'Média',
    strong: 'Forte',
};

export const passwordStrengthColor: Record<PasswordStrength, string> = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
};
