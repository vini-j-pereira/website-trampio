"use client";

import { useState } from "react";
import { useCep } from "@/hooks/useCep";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User, Briefcase, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerThunk, clearError, selectAuth } from "@/store/slices/authSlice";
import { SERVICE_AREAS_GROUPED } from "@/lib/serviceAreas";
import {
    validateEmail,
    validateCPF,
    validateCNPJ,
    validatePhone,
    formatCPF,
    formatCNPJ,
    formatPhone,
    getPasswordStrength,
    passwordStrengthLabel,
} from "@/lib/validations";

type Role = "client" | "professional";
type ClientDoc = "cpf" | "cnpj";

export default function RegisterPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector(selectAuth);

    const [role, setRole] = useState<Role>("client");
    const [clientDoc, setClientDoc] = useState<ClientDoc>("cpf");
    const [showPassword, setShowPassword] = useState(false);

    // Campos comuns
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    // Campos pessoa jurídica (CNPJ / Síndico)
    const [cnpj, setCnpj] = useState("");
    // Address for CNPJ (Síndico)
    const [addrStreet, setAddrStreet] = useState("");
    const [addrNumber, setAddrNumber] = useState("");
    const [addrComplement, setAddrComplement] = useState("");
    const [addrNeighborhood, setAddrNeighborhood] = useState("");
    const [addrCity, setAddrCity] = useState("");
    const [addrState, setAddrState] = useState("");

    const { cepValue: cnpjCep, setCep: setCnpjCep, loading: cepLoading, error: cepError } = useCep((addr) => {
        setAddrStreet(addr.street);
        setAddrNeighborhood(addr.neighborhood);
        setAddrCity(addr.city);
        setAddrState(addr.state);
    });

    // Campos CPF (cliente pessoa física)
    const [cpf, setCpf] = useState("");

    // Campos profissional
    const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
    const [document, setDocument] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [area, setArea] = useState("");
    const [radiusKm, setRadiusKm] = useState(10);
    const [experienceYrs, setExperienceYrs] = useState(0);
    const [bio, setBio] = useState("");

    // ── Validation derived states ──────────────────────────
    const emailError = email && !validateEmail(email) ? "Email inválido" : "";

    const cpfError = cpf && !validateCPF(cpf) ? "CPF inválido" : "";
    const cnpjError = cnpj && !validateCNPJ(cnpj) ? "CNPJ inválido" : "";
    const phoneError = phone && !validatePhone(phone) ? "Celular inválido" : "";

    const provDocError =
        document
            ? documentType === "CPF"
                ? !validateCPF(document) ? "CPF inválido" : ""
                : !validateCNPJ(document) ? "CNPJ inválido" : ""
            : "";

    const strength = getPasswordStrength(password);

    const isFormValid = () => {
        if (!name || !email || !password || password.length < 6) return false;
        if (emailError) return false;
        if (phone && phoneError) return false;
        if (role === "client" && clientDoc === "cpf" && cpf && cpfError) return false;
        if (role === "client" && clientDoc === "cnpj" && cnpj && cnpjError) return false;
        if (role === "professional" && document && provDocError) return false;
        if (role === "professional" && !area) return false;
        return true;
    };

    const handleRoleChange = (r: Role) => {
        dispatch(clearError());
        setRole(r);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        let result;

        if (role === "client" && clientDoc === "cpf") {
            result = await dispatch(registerThunk({ role: "CLIENT_CPF", email, password, name, cpf }));
        } else if (role === "client" && clientDoc === "cnpj") {
            const fullAddress = [addrStreet, addrNumber, addrComplement, addrNeighborhood, addrCity, addrState].filter(Boolean).join(", ");
            result = await dispatch(registerThunk({ role: "CLIENT_CNPJ", email, password, name, cnpj, address: fullAddress }));
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

    const strengthColors = {
        weak: "bg-red-500",
        medium: "bg-yellow-500",
        strong: "bg-green-500",
    };
    const strengthTextColors = {
        weak: "text-red-500",
        medium: "text-yellow-600",
        strong: "text-green-600",
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
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <input
                                className="input"
                                placeholder={role === "client" && clientDoc === "cnpj" ? "Nome da empresa" : "Nome completo"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                className={cn("input", emailError && "border-red-400")}
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                        </div>
                    </div>

                    {/* Celular */}
                    <div>
                        <input
                            className={cn("input", phoneError && "border-red-400")}
                            placeholder="Celular (opcional)"
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                        />
                        {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                    </div>

                    {/* Senha + força */}
                    <div>
                        <div className="relative">
                            <input
                                className="input pr-10"
                                type={showPassword ? "text" : "password"}
                                placeholder="Senha (mín. 6 caracteres)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {password && (
                            <div className="mt-2 space-y-1">
                                <div className="flex gap-1 h-1">
                                    {(["weak", "medium", "strong"] as const).map((s, i) => (
                                        <div
                                            key={s}
                                            className={cn(
                                                "flex-1 rounded-full transition-all",
                                                (strength === "weak" && i === 0) ||
                                                    (strength === "medium" && i <= 1) ||
                                                    strength === "strong"
                                                    ? strengthColors[strength]
                                                    : "bg-muted"
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className={cn("text-xs", strengthTextColors[strength])}>
                                    Força: {passwordStrengthLabel[strength]}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* CPF (cliente física) */}
                    {role === "client" && clientDoc === "cpf" && (
                        <div>
                            <input
                                className={cn("input", cpfError && "border-red-400")}
                                placeholder="CPF (opcional)"
                                value={cpf}
                                onChange={(e) => setCpf(formatCPF(e.target.value))}
                            />
                            {cpfError && <p className="text-xs text-red-500 mt-1">{cpfError}</p>}
                        </div>
                    )}

                    {/* CAMPOS CNPJ (SÍNDICO) */}
                    {role === "client" && clientDoc === "cnpj" && (
                        <>
                            <div>
                                <input
                                    className={cn("input", cnpjError && "border-red-400")}
                                    placeholder="CNPJ"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                                />
                                {cnpjError && <p className="text-xs text-red-500 mt-1">{cnpjError}</p>}
                            </div>

                            {/* Address auto-fill via CEP */}
                            <hr className="border-border" />
                            <h3 className="text-sm font-medium text-muted-foreground">Endereço do condomínio</h3>

                            <div className="relative">
                                <input
                                    className="input pr-8"
                                    placeholder="CEP (auto-preenche)"
                                    value={cnpjCep}
                                    onChange={(e) => setCnpjCep(e.target.value)}
                                    maxLength={9}
                                />
                                {cepLoading && <span className="absolute right-3 top-2.5 text-xs text-muted-foreground animate-pulse">...</span>}
                                {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                            </div>

                            <div className="grid md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <input className="input" placeholder="Logradouro" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} />
                                </div>
                                <input className="input" placeholder="Número" value={addrNumber} onChange={(e) => setAddrNumber(e.target.value)} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                                <input className="input" placeholder="Complemento" value={addrComplement} onChange={(e) => setAddrComplement(e.target.value)} />
                                <input className="input" placeholder="Bairro" value={addrNeighborhood} onChange={(e) => setAddrNeighborhood(e.target.value)} />
                            </div>

                            <div className="grid md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <input className="input" placeholder="Cidade" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} />
                                </div>
                                <input className="input" placeholder="UF" maxLength={2} value={addrState} onChange={(e) => setAddrState(e.target.value.toUpperCase().slice(0, 2))} />
                            </div>
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
                                    onChange={(e) => { setDocumentType(e.target.value as "CPF" | "CNPJ"); setDocument(""); }}
                                >
                                    <option value="CPF">CPF — Pessoa Física</option>
                                    <option value="CNPJ">CNPJ — Pessoa Jurídica</option>
                                </select>
                                <div>
                                    <input
                                        className={cn("input", provDocError && "border-red-400")}
                                        placeholder={`Número do ${documentType}`}
                                        value={document}
                                        onChange={(e) =>
                                            setDocument(documentType === "CPF" ? formatCPF(e.target.value) : formatCNPJ(e.target.value))
                                        }
                                    />
                                    {provDocError && <p className="text-xs text-red-500 mt-1">{provDocError}</p>}
                                </div>
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

                            {/* Área de atuação — completa e agrupada */}
                            <select
                                className="input"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                required
                            >
                                <option value="">Área de atuação *</option>
                                {SERVICE_AREAS_GROUPED.map((group) => (
                                    <optgroup key={group.category} label={group.category}>
                                        {group.items.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </optgroup>
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
                        disabled={loading || !isFormValid()}
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
