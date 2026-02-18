"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [role, setRole] = useState<"client" | "professional">("client");

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <Link
                href="/"
                className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Home
            </Link>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8">
                <div className="text-center mb-8">
                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">T</span>
                    </div>
                    <h1 className="text-2xl font-bold">Crie sua conta</h1>
                    <p className="text-muted-foreground mt-2">
                        Comece a usar o Trampio hoje mesmo
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setRole("client")}
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                            role === "client"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                        )}
                    >
                        <User className="h-6 w-6" />
                        <span className="font-medium text-sm">Cliente</span>
                    </button>
                    <button
                        onClick={() => setRole("professional")}
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                            role === "professional"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                        )}
                    >
                        <Briefcase className="h-6 w-6" />
                        <span className="font-medium text-sm">Profissional</span>
                    </button>
                </div>

                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="name">
                                Nome
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="lastname">
                                Sobrenome
                            </label>
                            <input
                                type="text"
                                id="lastname"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Sobrenome"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="seu@email.com"
                        />
                    </div>

                    {role === "professional" && (
                        <div>
                            <label className="block text-sm font-medium mb-1.5" htmlFor="profession">
                                Profissão / Área de Atuação
                            </label>
                            <select
                                id="profession"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Selecione...</option>
                                <option value="pedreiro">Pedreiro</option>
                                <option value="jardineiro">Jardineiro</option>
                                <option value="eletricista">Eletricista</option>
                                <option value="personal">Personal Trainer</option>
                                <option value="chef">Cozinheiro/Chef</option>
                                <option value="dev">Desenvolvedor</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="password">
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Criar conta como {role === "client" ? "Cliente" : "Profissional"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Entrar
                    </Link>
                </div>
            </div>
        </div>
    );
}
