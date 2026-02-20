"use client";

import Link from "next/link";
import {
    Search,
    Clock,
    Settings,
    LogOut,
    MapPin,
    Plus,
    ImagePlus,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Trash2,
    X,
    UserPlus,
    Bell,
    MessageCircle,
    Lock,
} from "lucide-react";
import { useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────
type Status = "urgente" | "normal" | "flexivel";

interface ServiceRequest {
    id: number;
    title: string;
    description: string;
    status: Status;
    photo: string | null;
    professionals: string[];
    createdAt: string;
}

// ── Mock user ────────────────────────────────────────────
const mockUser = {
    name: "João Silva",
    email: "joao@email.com",
    avatar: "JS",
    location: "São Paulo, SP",
    memberSince: "Fevereiro 2026",
};

// ── Status config ────────────────────────────────────────
const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
    urgente: { label: "🔴 Urgente", color: "text-red-600", bg: "bg-red-50 border-red-200" },
    normal: { label: "🟡 Normal", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
    flexivel: { label: "🟢 Flexível", color: "text-green-600", bg: "bg-green-50 border-green-200" },
};

// ── Mini popup for adding a professional ─────────────────
function AddProfessionalPopup({
    onAdd,
    onClose,
}: {
    onAdd: (name: string) => void;
    onClose: () => void;
}) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleConfirm = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        onClose();
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Popup card */}
            <div className="w-full max-w-xs rounded-2xl bg-white border border-border shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Adicionar profissional</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <input
                    ref={inputRef}
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") onClose(); }}
                    placeholder="Ex: Pedreiro, Pintor..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-3"
                />

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-md border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!value.trim()}
                        className="flex-1 rounded-md bg-primary py-2 text-sm text-white font-medium hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────
export default function UserProfilePage() {
    const [activeTab, setActiveTab] = useState<"services" | "history" | "settings">("services");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddProf, setShowAddProf] = useState(false);
    const [services, setServices] = useState<ServiceRequest[]>([]);

    // Form state
    const [formTitle, setFormTitle] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formStatus, setFormStatus] = useState<Status>("normal");
    const [formPhoto, setFormPhoto] = useState<string | null>(null);
    const [formProfessionals, setFormProfessionals] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addProfessional = (name: string) => {
        if (!formProfessionals.includes(name)) {
            setFormProfessionals((prev) => [...prev, name]);
        }
    };

    const removeProfessional = (name: string) => {
        setFormProfessionals((prev) => prev.filter((p) => p !== name));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setFormPhoto(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formDesc.trim()) return;
        setServices((prev) => [
            {
                id: Date.now(),
                title: formTitle.trim(),
                description: formDesc.trim(),
                status: formStatus,
                photo: formPhoto,
                professionals: formProfessionals,
                createdAt: new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "short", year: "numeric",
                }),
            },
            ...prev,
        ]);
        resetModal();
    };

    const handleDelete = (id: number) => {
        setServices((prev) => prev.filter((s) => s.id !== id));
    };

    const resetModal = () => {
        setShowCreateModal(false);
        setShowAddProf(false);
        setFormTitle("");
        setFormDesc("");
        setFormStatus("normal");
        setFormPhoto(null);
        setFormProfessionals([]);
    };

    return (
        <div className="min-h-screen bg-muted/20">

            {/* ── Header ── */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                    <Link href="/" className="font-bold text-xl text-primary">Trampio</Link>
                    <div className="flex items-center gap-2">
                        {/* Chat */}
                        <Link
                            href="/chat"
                            className="relative flex items-center justify-center h-9 w-9 rounded-full border border-border bg-white shadow-sm hover:bg-muted transition"
                            title="Chat"
                        >
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white" />
                        </Link>
                        {/* Notifications */}
                        <button
                            className="relative flex items-center justify-center h-9 w-9 rounded-full border border-border bg-white shadow-sm hover:bg-muted transition"
                            title="Notificações"
                        >
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                        </button>
                        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1.5 ml-1">
                            <LogOut className="h-4 w-4" /> Sair
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid gap-6 md:grid-cols-3">

                    {/* ── Sidebar ── */}
                    <aside className="md:col-span-1 space-y-4">
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-md mb-4">
                                    <span className="text-white font-bold text-2xl">{mockUser.avatar}</span>
                                </div>
                                <h2 className="text-xl font-bold">{mockUser.name}</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">{mockUser.email}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />{mockUser.location}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Membro desde {mockUser.memberSince}</p>
                            </div>

                            <hr className="my-5 border-border" />

                            <nav className="space-y-1">
                                {[
                                    { tab: "services" as const, icon: AlertCircle, label: "Meus Pedidos" },
                                    { tab: "history" as const, icon: Clock, label: "Histórico" },
                                    { tab: "settings" as const, icon: Settings, label: "Configurações" },
                                ].map(({ tab, icon: Icon, label }) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${activeTab === tab
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                        {tab === "services" && services.length > 0 && (
                                            <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary font-semibold">
                                                {services.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Pedidos", value: services.length.toString() },
                                { label: "Concluídos", value: "0" },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-2xl border border-border bg-white p-4 shadow-sm text-center">
                                    <p className="text-2xl font-bold text-primary">{value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* ── Main area ── */}
                    <div className="md:col-span-2 space-y-5">

                        {/* TAB: Meus Pedidos */}
                        {activeTab === "services" && (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-lg font-bold">Meus Pedidos</h1>
                                        <p className="text-sm text-muted-foreground mt-0.5">Crie um pedido antes de buscar profissionais</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-white font-medium hover:bg-primary/90 transition shadow-sm"
                                    >
                                        <Plus className="h-4 w-4" /> Novo Pedido
                                    </button>
                                </div>

                                {/* Locked search banner — only when no services */}
                                {services.length === 0 && (
                                    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Busca de profissionais bloqueada</p>
                                            <p className="text-xs text-muted-foreground">Crie um pedido primeiro para desbloquear a busca.</p>
                                        </div>
                                        <Search className="h-5 w-5 text-muted-foreground/30" />
                                    </div>
                                )}

                                {services.length === 0 && (
                                    <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center">
                                        <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <AlertCircle className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-semibold text-base mb-1">Nenhum pedido ainda</h3>
                                        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                                            Crie um pedido com os profissionais que você precisa e depois busque cada um deles.
                                        </p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-white font-medium hover:bg-primary/90 transition"
                                        >
                                            <Plus className="h-4 w-4" /> Criar meu primeiro pedido
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {services.map((s) => (
                                        <div key={s.id} className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                                            {s.photo && (
                                                <div className="h-44 w-full overflow-hidden">
                                                    <img src={s.photo} alt="Pedido" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig[s.status].bg} ${statusConfig[s.status].color}`}>
                                                                {statusConfig[s.status].label}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{s.createdAt}</span>
                                                        </div>
                                                        <h3 className="font-semibold">{s.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(s.id)}
                                                        className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Professionals */}
                                                {s.professionals.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <div className="flex items-center gap-1.5 text-xs text-green-600 mb-3">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <span className="font-medium">Profissionais necessários</span>
                                                        </div>
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            {s.professionals.map((prof) => (
                                                                <div
                                                                    key={prof}
                                                                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                                                                >
                                                                    <span className="text-sm font-medium">{prof}</span>
                                                                    <Link
                                                                        href={`/search?service=${encodeURIComponent(prof)}`}
                                                                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-white font-semibold hover:bg-primary/90 transition whitespace-nowrap"
                                                                    >
                                                                        <Search className="h-3 w-3" />
                                                                        Buscar
                                                                        <ChevronRight className="h-3 w-3" />
                                                                    </Link>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {s.professionals.length === 0 && (
                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <p className="text-xs text-muted-foreground italic">Nenhum profissional adicionado a este pedido.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* TAB: Histórico */}
                        {activeTab === "history" && (
                            <div className="rounded-2xl border border-border bg-white shadow-sm p-8 text-center">
                                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <h3 className="font-semibold mb-1">Histórico vazio</h3>
                                <p className="text-sm text-muted-foreground">Seus serviços concluídos aparecerão aqui.</p>
                            </div>
                        )}

                        {/* TAB: Configurações */}
                        {activeTab === "settings" && (
                            <div className="rounded-2xl border border-border bg-white shadow-sm p-6 space-y-4">
                                <h2 className="font-semibold">Configurações da Conta</h2>
                                {[
                                    { label: "Nome completo", value: mockUser.name },
                                    { label: "E-mail", value: mockUser.email },
                                    { label: "Localização", value: mockUser.location },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                                        <input
                                            defaultValue={value}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                ))}
                                <button className="rounded-md bg-primary px-5 py-2 text-sm text-white font-medium hover:bg-primary/90 transition">
                                    Salvar alterações
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Mini popup: Add Professional ── */}
            {showAddProf && (
                <AddProfessionalPopup
                    onAdd={addProfessional}
                    onClose={() => setShowAddProf(false)}
                />
            )}

            {/* ── Create Service Modal ── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                            <div>
                                <h2 className="font-bold text-base">Novo Pedido de Serviço</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Descreva o que você precisa</p>
                            </div>
                            <button onClick={resetModal} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleCreate} className="px-6 py-5 space-y-5 overflow-y-auto">

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Título do pedido <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Ex: Reforma do meu apartamento"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Descrição <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Ex: Quero reformar meu apartamento alugado. Pintar as paredes, revisar a parte elétrica e trocar o piso da cozinha."
                                    required
                                    rows={3}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                />
                            </div>

                            {/* Professionals */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Profissionais necessários</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddProf(true)}
                                        className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary font-medium hover:bg-primary/10 transition"
                                    >
                                        <UserPlus className="h-3.5 w-3.5" />
                                        Adicionar profissional
                                    </button>
                                </div>

                                {formProfessionals.length === 0 ? (
                                    <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-5 text-center text-sm text-muted-foreground">
                                        Nenhum profissional adicionado.<br />
                                        <span className="text-xs">Clique em &ldquo;Adicionar profissional&rdquo; para incluir.</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {formProfessionals.map((p) => (
                                            <span
                                                key={p}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary"
                                            >
                                                {p}
                                                <button
                                                    type="button"
                                                    onClick={() => removeProfessional(p)}
                                                    className="rounded-full hover:bg-primary/20 transition p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status / Urgência */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Urgência</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(Object.keys(statusConfig) as Status[]).map((s) => (
                                        <button
                                            type="button"
                                            key={s}
                                            onClick={() => setFormStatus(s)}
                                            className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${formStatus === s
                                                ? `${statusConfig[s].bg} ${statusConfig[s].color} border-current`
                                                : "border-border text-muted-foreground hover:border-muted-foreground/40"
                                                }`}
                                        >
                                            {statusConfig[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Photo upload */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Foto do local / problema</label>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
                                {formPhoto ? (
                                    <div className="relative rounded-xl overflow-hidden border border-border h-36">
                                        <img src={formPhoto} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormPhoto(null)}
                                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition"
                                    >
                                        <ImagePlus className="h-7 w-7" />
                                        <span>Clique para adicionar uma foto</span>
                                        <span className="text-xs opacity-60">JPG, PNG, WEBP até 10 MB</span>
                                    </button>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pb-1">
                                <button
                                    type="button"
                                    onClick={resetModal}
                                    className="flex-1 rounded-md border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formTitle.trim() || !formDesc.trim()}
                                    className="flex-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Criar Pedido
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
