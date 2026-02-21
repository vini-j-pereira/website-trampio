"use client";

import Link from "next/link";
import { ArrowLeft, User, Briefcase, ArrowRight, CreditCard, Building2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type UserType = "client" | "provider" | null;
type DocumentType = "cpf" | "cnpj" | null;
type Step = 1 | 1.5 | 2;

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [userType, setUserType] = useState<UserType>(null);
    const [documentType, setDocumentType] = useState<DocumentType>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const handleTypeSelect = (type: UserType) => {
        setUserType(type);
        if (type === "provider") {
            // Providers skip the CPF/CNPJ step
            setStep(2);
        } else {
            // Clients must choose CPF or CNPJ
            setStep(1.5);
        }
    };

    const handleDocumentSelect = (doc: DocumentType) => {
        setDocumentType(doc);
        setStep(2);
    };

    const handleBack = () => {
        if (step === 2) {
            if (userType === "client") {
                setStep(1.5);
            } else {
                setStep(1);
            }
        } else if (step === 1.5) {
            setStep(1);
            setDocumentType(null);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (userType === "provider") {
            router.push("/dashboard/provider");
        } else if (userType === "client" && documentType === "cnpj") {
            router.push("/dashboard");
        } else {
            router.push("/profile");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20 relative">
            {/* Back button */}
            {step === 1 ? (
                <Link
                    href="/"
                    className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para Home
                </Link>
            ) : (
                <button
                    onClick={handleBack}
                    className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </button>
            )}

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xl">T</span>
                    </div>
                </div>

                {/* ── STEP 1: Type selection ── */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold">Bem-vindo ao Trampio</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Como você quer entrar?
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Common User */}
                            <button
                                onClick={() => handleTypeSelect("client")}
                                className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all duration-200"
                            >
                                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <User className="h-7 w-7 text-blue-600 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-sm">Usuário</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Busco serviços
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>

                            {/* Service Provider */}
                            <button
                                onClick={() => handleTypeSelect("provider")}
                                className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all duration-200"
                            >
                                <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Briefcase className="h-7 w-7 text-orange-500 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-sm">Prestador</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Ofereço serviços
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Não tem uma conta?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Cadastre-se
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── STEP 1.5: CPF / CNPJ selection (clients only) ── */}
                {step === 1.5 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold">Tipo de conta</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Você é pessoa física ou jurídica?
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* CPF – Pessoa Física */}
                            <button
                                onClick={() => handleDocumentSelect("cpf")}
                                className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all duration-200"
                            >
                                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <CreditCard className="h-7 w-7 text-blue-600 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-sm">CPF</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Pessoa Física
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>

                            {/* CNPJ – Pessoa Jurídica */}
                            <button
                                onClick={() => handleDocumentSelect("cnpj")}
                                className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all duration-200"
                            >
                                <div className="h-14 w-14 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Building2 className="h-7 w-7 text-purple-600 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-sm">CNPJ</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Pessoa Jurídica
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Não tem uma conta?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Cadastre-se
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Login form ── */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Type badge */}
                        <div className="flex justify-center mb-6">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium">
                                {userType === "provider" ? (
                                    <>
                                        <Briefcase className="h-4 w-4 text-orange-500" />
                                        Prestador de Serviço
                                    </>
                                ) : documentType === "cnpj" ? (
                                    <>
                                        <Building2 className="h-4 w-4 text-purple-600" />
                                        Pessoa Jurídica (CNPJ)
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                        Pessoa Física (CPF)
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Acesse sua conta para continuar
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5" htmlFor="password">
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-muted-foreground">Lembrar-me</span>
                                </label>
                                <Link href="#" className="text-primary hover:underline font-medium">
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Entrar
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Não tem uma conta?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Cadastre-se
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
