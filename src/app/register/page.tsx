"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User, Briefcase, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerThunk, clearError, selectAuth } from "@/store/slices/authSlice";

type Role = "client" | "professional";
type ClientDoc = "cpf" | "cnpj";

const AREAS = [
    "Pedreiro", "Eletricista", "Encanador", "Pintor", "Marceneiro",
    "Jardineiro", "Desenvolvedor", "Designer", "Personal Trainer",
    "Chef", "Fotógrafo", "Cuidador", "Professor", "Outros",
];

export default function RegisterPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector(selectAuth);

    const [role, setRole] = useState<Role>("client");
    const [clientDoc, setClientDoc] = useState<ClientDoc>("cpf");

    // Campos comuns
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Campos pessoa jurídica (CNPJ / Síndico)
    const [cnpj, setCnpj] = useState("");
    const [address, setAddress] = useState("");

    // Campos profissional
    const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
    const [document, setDocument] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [area, setArea] = useState("");
    const [radiusKm, setRadiusKm] = useState(10);
    const [experienceYrs, setExperienceYrs] = useState(0);
    const [bio, setBio] = useState("");

    const handleRoleChange = (r: Role) => {
        dispatch(clearError());
        setRole(r);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let result;

        if (role === "client" && clientDoc === "cpf") {
            result = await dispatch(registerThunk({ role: "CLIENT_CPF", email, password, name }));
        } else if (role === "client" && clientDoc === "cnpj") {
            result = await dispatch(registerThunk({ role: "CLIENT_CNPJ", email, password, name, cnpj, address }));
        } else {
            if (!area) return;
            result = await dispatch(registerThunk({
                role: "PROVIDER",
                email,
                password,
                name,
                document_type: documentType,
                document,
                company_name: companyName,
                bio,
                area,
                radius_km: radiusKm,
                experience_yrs: experienceYrs,
            }));
        }

        if (result && registerThunk.fulfilled.match(result)) {
            const userRole = result.payload.user.role;
            if (userRole === "PROVIDER") {
                router.push("/dashboard/provider");
            } else if (userRole === "CLIENT_CNPJ") {
                router.push("/dashboard");
            } else {
                router.push("/profile");
            }
        }
    };

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
                    <h1 className="text-2xl font-bold mt-4">Crie sua conta</h1>
                    <p className="text-muted-foreground mt-2">Comece a usar o Trampio hoje mesmo</p>
                </div>

                {/* ROLE */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => handleRoleChange("client")}
                        className={cn(
                            "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                            role === "client"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                    >
                        <User className="h-6 w-6" />
                        Cliente
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleChange("professional")}
                        className={cn(
                            "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                            role === "professional"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                    >
                        <Briefcase className="h-6 w-6" />
                        Profissional
                    </button>
                </div>

                {/* Tipo de cliente: CPF ou CNPJ */}
                {role === "client" && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {(["cpf", "cnpj"] as ClientDoc[]).map((doc) => (
                            <button
                                key={doc}
                                type="button"
                                onClick={() => setClientDoc(doc)}
                                className={cn(
                                    "py-2 rounded-lg border text-sm font-medium transition-all",
                                    clientDoc === doc
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border text-muted-foreground"
                                )}
                            >
                                {doc.toUpperCase()} — {doc === "cpf" ? "Pessoa Física" : "Pessoa Jurídica"}
                            </button>
                        ))}
                    </div>
                )}

                {/* Erro da API */}
                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* FORM */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            className="input"
                            placeholder={role === "client" && clientDoc === "cnpj" ? "Nome da empresa" : "Nome completo"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            className="input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <input
                        className="input"
                        type="password"
                        placeholder="Senha (mín. 6 caracteres)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                    />

                    {/* CAMPOS CNPJ (CLIENTE JURÍDICO) */}
                    {role === "client" && clientDoc === "cnpj" && (
                        <>
                            <input
                                className="input"
                                placeholder="CNPJ"
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value)}
                            />
                            <input
                                className="input"
                                placeholder="Endereço do condomínio"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </>
                    )}

                    {/* CAMPOS PROFISSIONAL */}
                    {role === "professional" && (
                        <>
                            <hr className="my-2" />
                            <h3 className="font-semibold text-lg">Informações profissionais</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <select
                                    className="input"
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value as "CPF" | "CNPJ")}
                                >
                                    <option value="CPF">CPF</option>
                                    <option value="CNPJ">CNPJ</option>
                                </select>
                                <input
                                    className="input"
                                    placeholder="Número do documento"
                                    value={document}
                                    onChange={(e) => setDocument(e.target.value)}
                                />
                            </div>

                            <input
                                className="input"
                                placeholder="Nome da empresa (opcional)"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />

                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Raio de atendimento (km)"
                                    min={1}
                                    value={radiusKm}
                                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                                />
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Anos de experiência"
                                    min={0}
                                    value={experienceYrs}
                                    onChange={(e) => setExperienceYrs(Number(e.target.value))}
                                />
                            </div>

                            <select
                                className="input"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                required
                            >
                                <option value="">Área de atuação *</option>
                                {AREAS.map((a) => (
                                    <option key={a}>{a}</option>
                                ))}
                            </select>

                            <textarea
                                className="input min-h-[100px]"
                                placeholder="Conte um pouco sobre você..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-semibold h-11 rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Criando conta...</>
                        ) : (
                            `Criar conta como ${role === "client" ? (clientDoc === "cnpj" ? "Empresa (CNPJ)" : "Cliente") : "Profissional"}`
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Entrar
                    </Link>
                </div>
            </div>
        </div>
    );
}
