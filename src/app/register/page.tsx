"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [role, setRole] = useState<"client" | "professional">("client");

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
            <Link
                href="/"
                className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Home
            </Link>

            <div className="w-full max-w-2xl bg-white rounded-2xl border shadow-sm p-8">

                {/* HEADER */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <Image
                            className="flex items-center justify-center mx-auto"
                            src="/images/LogoPreta.png"
                            alt="Logo"
                            width={120}
                            height={30}
                        />
                    </Link>

                    <h1 className="text-2xl font-bold">Crie sua conta</h1>
                    <p className="text-muted-foreground mt-2">
                        Comece a usar o Trampio hoje mesmo
                    </p>
                </div>

                {/* ROLE */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setRole("client")}
                        className={cn(
                            "p-4 rounded-xl border flex flex-col items-center gap-2",
                            role === "client"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground"
                        )}
                    >
                        <User className="h-6 w-6" />
                        Cliente
                    </button>

                    <button
                        onClick={() => setRole("professional")}
                        className={cn(
                            "p-4 rounded-xl border flex flex-col items-center gap-2",
                            role === "professional"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground"
                        )}
                    >
                        <Briefcase className="h-6 w-6" />
                        Profissional
                    </button>
                </div>

                {/* FORM */}
                <form className="space-y-5">

                    {/* BASIC */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <input className="input" placeholder="Nome" />
                        <input className="input" placeholder="Sobrenome" />
                    </div>

                    <input className="input" type="email" placeholder="Email" />
                    <input className="input" type="password" placeholder="Senha" />

                    {/* PROFESSIONAL ONLY */}
                    {role === "professional" && (
                        <>
                            <hr className="my-2" />

                            <h3 className="font-semibold text-lg">
                                Informações profissionais
                            </h3>

                            {/* DOCUMENT */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <select className="input">
                                    <option value="">Tipo de documento</option>
                                    <option value="cpf">CPF</option>
                                    <option value="cnpj">CNPJ</option>
                                </select>

                                <input
                                    className="input"
                                    placeholder="Número do documento"
                                />
                            </div>

                            <input
                                className="input"
                                placeholder="Nome da empresa (opcional)"
                            />

                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Raio de atendimento (km)"
                                    defaultValue={10}
                                />

                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Anos de experiência"
                                />
                            </div>

                            <select className="input">
                                <option value="">Área de atuação</option>
                                <option>Pedreiro</option>
                                <option>Eletricista</option>
                                <option>Desenvolvedor</option>
                                <option>Personal Trainer</option>
                                <option>Chef</option>
                            </select>

                            <textarea
                                className="input min-h-[120px]"
                                placeholder="Conte um pouco sobre você..."
                            />
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold h-11 rounded-md hover:bg-primary/90 transition"
                    >
                        Criar conta como {role === "client" ? "Cliente" : "Profissional"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="text-primary font-medium">
                        Entrar
                    </Link>
                </div>
            </div>
        </div>
    );
}
