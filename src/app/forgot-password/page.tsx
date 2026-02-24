"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle2, Key } from "lucide-react";
import { passwordApi } from "@/store/api/api";
import {
    validateEmail,
    getPasswordStrength,
    passwordStrengthLabel,
    passwordStrengthColor,
} from "@/lib/validations";

type Step = "email" | "sent" | "reset" | "done";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const emailErr = email && !validateEmail(email) ? "Email inválido" : "";
    const strength = getPasswordStrength(newPassword);

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail(email)) { setError("Email inválido"); return; }
        setLoading(true);
        setError("");
        try {
            await passwordApi.forgot(email);
            setStep("sent");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) { setError("Informe o código recebido."); return; }
        if (newPassword.length < 6) { setError("Senha deve ter ao menos 6 caracteres."); return; }
        if (newPassword !== confirmPassword) { setError("As senhas não coincidem."); return; }

        setLoading(true);
        setError("");
        try {
            await passwordApi.reset(token.trim(), newPassword);
            setStep("done");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <Link
                href="/login"
                className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Login
            </Link>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xl">T</span>
                    </div>
                </div>

                {/* ── STEP: email input ── */}
                {step === "email" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center mb-8">
                            <Mail className="mx-auto h-10 w-10 text-primary mb-3" />
                            <h1 className="text-2xl font-bold">Recuperar senha</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Informe seu e-mail e enviaremos um código de recuperação.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleForgot} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="seu@email.com"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {emailErr && <p className="text-xs text-red-500 mt-1">{emailErr}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !!emailErr}
                                className="w-full bg-primary text-white font-semibold h-10 rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : "Enviar código"}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── STEP: email sent ── */}
                {step === "sent" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
                        <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Código enviado!</h1>
                        <p className="text-muted-foreground text-sm mb-6">
                            Se o e-mail existir, um código foi enviado. Verifique sua caixa de entrada.
                        </p>
                        <button
                            onClick={() => setStep("reset")}
                            className="w-full bg-primary text-white font-semibold h-10 rounded-md hover:bg-primary/90 transition"
                        >
                            Inserir código e nova senha
                        </button>
                    </div>
                )}

                {/* ── STEP: reset form ── */}
                {step === "reset" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center mb-6">
                            <Key className="mx-auto h-10 w-10 text-primary mb-3" />
                            <h1 className="text-2xl font-bold">Nova senha</h1>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Código de recuperação</label>
                                <input
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    required
                                    placeholder="Cole o código aqui"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Nova senha</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {newPassword && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex gap-1 h-1">
                                            {(['weak', 'medium', 'strong'] as const).map((s) => (
                                                <div
                                                    key={s}
                                                    className={`flex-1 rounded-full transition-all ${strength === 'weak' && s === 'weak'
                                                            ? 'bg-red-500'
                                                            : strength === 'medium' && (s === 'weak' || s === 'medium')
                                                                ? 'bg-yellow-500'
                                                                : strength === 'strong'
                                                                    ? 'bg-green-500'
                                                                    : 'bg-muted'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs ${strength === 'weak' ? 'text-red-500' : strength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                                            Força: {passwordStrengthLabel[strength]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Confirmar nova senha</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white font-semibold h-10 rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : "Redefinir senha"}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── STEP: done ── */}
                {step === "done" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Senha redefinida!</h1>
                        <p className="text-muted-foreground text-sm mb-6">Sua senha foi redefinida com sucesso.</p>
                        <Link
                            href="/login"
                            className="block w-full bg-primary text-white font-semibold h-10 rounded-md hover:bg-primary/90 transition leading-10 text-sm"
                        >
                            Entrar na conta
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
