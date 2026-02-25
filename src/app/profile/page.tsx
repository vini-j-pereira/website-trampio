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
    Sliders,
    Trash2,
    X,
    UserPlus,
    Bell,
    MessageCircle,
    Lock,
    Loader2,
    Save,
    User,
    Camera,
    Briefcase,
} from "lucide-react";
import { formatCNPJ } from "@/lib/validations";
import { SERVICE_AREAS_GROUPED } from "@/lib/serviceAreas";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, selectUser, fetchMeThunk } from "@/store/slices/authSlice";
import {
    fetchProfileThunk,
    updateProfileThunk,
    selectProfile,
} from "@/store/slices/profileSlice";
import {
    fetchRequestsThunk,
    createRequestThunk,
    deleteRequestThunk,
    selectRequests,
} from "@/store/slices/requestsSlice";
import { useCep } from "@/hooks/useCep";
import { useRouter } from "next/navigation";
import { profileApi, PortfolioPhotoData } from "@/store/api/api";

// ── Status config ────────────────────────────────────────────
type Urgency = "URGENTE" | "NORMAL" | "FLEXIVEL";

const urgencyConfig: Record<Urgency, { label: string; color: string; bg: string }> = {
    URGENTE: { label: "🔴 Urgente", color: "text-red-600", bg: "bg-red-50 border-red-200" },
    NORMAL: { label: "🟡 Normal", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
    FLEXIVEL: { label: "🟢 Flexível", color: "text-green-600", bg: "bg-green-50 border-green-200" },
};

// ── Mini popup for adding a professional ─────────────────────
function AddProfessionalPopup({ onAdd, onClose }: { onAdd: (name: string) => void; onClose: () => void }) {
    const [value, setValue] = useState("");
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-xs rounded-2xl bg-white border border-border shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Adicionar profissional</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition"><X className="h-4 w-4" /></button>
                </div>
                <select autoFocus value={value} onChange={(e) => setValue(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-3">
                    <option value="">Selecione o tipo de profissional...</option>
                    {SERVICE_AREAS_GROUPED.map((group) => (
                        <optgroup key={group.category} label={group.category}>
                            {group.items.map((item) => (<option key={item} value={item}>{item}</option>))}
                        </optgroup>
                    ))}
                </select>
                <div className="flex gap-2">
                    <button type="button" onClick={onClose} className="flex-1 rounded-md border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition">Cancelar</button>
                    <button type="button" onClick={() => { if (value) { onAdd(value); onClose(); } }} disabled={!value}
                        className="flex-1 rounded-md bg-primary py-2 text-sm text-white font-medium hover:bg-primary/90 transition disabled:opacity-40">Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── helpers ───────────────────────────────────────────────────
function getInitials(name?: string) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── CEP Field sub-component ───────────────────────────────────
function CepField({ value, onChange, loading, error }: {
    value: string; onChange: (v: string) => void; loading: boolean; error: string;
}) {
    return (
        <div>
            <label className="block text-xs text-muted-foreground mb-1">CEP</label>
            <div className="relative">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pr-8"
                />
                {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────
export default function UserProfilePage() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const authUser = useAppSelector(selectUser);
    const { data: profileData, loading: profileLoading } = useAppSelector(selectProfile);
    const { items: requests, loading: requestsLoading } = useAppSelector(selectRequests);

    const [activeTab, setActiveTab] = useState<"services" | "history" | "settings" | "portfolio">("services");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddProf, setShowAddProf] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Create-request form
    const [formTitle, setFormTitle] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formUrgency, setFormUrgency] = useState<Urgency>("NORMAL");
    const [formPhoto, setFormPhoto] = useState<string | undefined>(undefined);
    const [formProfessionals, setFormProfessionals] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Settings form
    const cp = profileData?.clientProfile;
    const pp = profileData?.providerProfile;
    const [settingsName, setSettingsName] = useState("");
    const [settingsAvatar, setSettingsAvatar] = useState<string | null>(null);
    const [settingsStreet, setSettingsStreet] = useState("");
    const [settingsNumber, setSettingsNumber] = useState("");
    const [settingsComplement, setSettingsComplement] = useState("");
    const [settingsNeighborhood, setSettingsNeighborhood] = useState("");
    const [settingsCity, setSettingsCity] = useState("");
    const [settingsState, setSettingsState] = useState("");

    // Provider specific settings
    const [settingsBio, setSettingsBio] = useState("");
    const [settingsArea, setSettingsArea] = useState("");
    const [settingsRadius, setSettingsRadius] = useState(10);
    const [settingsAvailability, setSettingsAvailability] = useState<"AVAILABLE" | "BUSY" | "VACATION">("AVAILABLE");
    const [settingsCompany, setSettingsCompany] = useState("");

    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState("");
    const [settingsCnpj, setSettingsCnpj] = useState("");
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Portfolio state
    const [portfolio, setPortfolio] = useState<PortfolioPhotoData[]>([]);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const portfolioInputRef = useRef<HTMLInputElement>(null);

    // CEP hook wired to settings form
    const { cepValue, setCep: handleCepChange, loading: cepLoading, error: cepError } = useCep((addr) => {
        setSettingsStreet(addr.street);
        setSettingsNeighborhood(addr.neighborhood);
        setSettingsCity(addr.city);
        setSettingsState(addr.state);
    });

    // ── Load data on mount ────────────────────────────────────
    useEffect(() => {
        if (!authUser) {
            dispatch(fetchMeThunk()).unwrap().catch(() => router.replace("/login"));
        }
        dispatch(fetchProfileThunk());
        dispatch(fetchRequestsThunk());
    }, [dispatch, authUser, router]);

    // Pre-fill settings when profile loads
    useEffect(() => {
        if (cp) {
            setSettingsName(cp.name ?? "");
            setSettingsStreet(cp.street ?? "");
            setSettingsNumber(cp.number ?? "");
            setSettingsComplement(cp.complement ?? "");
            setSettingsNeighborhood(cp.neighborhood ?? "");
            setSettingsCity(cp.city ?? "");
            setSettingsState(cp.state ?? "");
            if (cp.avatar_url) setSettingsAvatar(cp.avatar_url);
            if (cp.cep) handleCepChange(cp.cep);
        }
        if (pp) {
            setSettingsName(pp.name ?? "");
            setSettingsBio(pp.bio ?? "");
            setSettingsArea(pp.area ?? "");
            setSettingsRadius(pp.radius_km ?? 10);
            setSettingsAvailability(pp.availability ?? "AVAILABLE");
            setSettingsCompany(pp.company_name ?? "");
            setSettingsCnpj(pp.document ?? "");
            if (pp.avatar_url) setSettingsAvatar(pp.avatar_url);
            if (pp.portfolio) setPortfolio(pp.portfolio);
        }
        if (profileData?.condoProfile) {
            const con = profileData.condoProfile;
            setSettingsName(con.name ?? "");
            setSettingsCnpj(con.cnpj ?? "");
            if (con.avatar_url) setSettingsAvatar(con.avatar_url);
            // Parse address if it exists to fill city/state etc or just use address as a single string
            // For now, let's keep it simple or use the already parsed address if available
            setSettingsStreet(con.address ?? "");
            setSettingsCity(con.city ?? "");
            setSettingsState(con.state ?? "");
        }
    }, [cp, pp, profileData?.condoProfile]);

    // Derived display values
    // Derived display values
    const displayName = pp?.name || cp?.name || profileData?.condoProfile?.name || authUser?.email?.split("@")[0] || "Usuário";
    const displayEmail = authUser?.email ?? "";
    const displayLocation = [
        settingsCity || pp?.city || cp?.city || profileData?.condoProfile?.city,
        settingsState || pp?.state || cp?.state || profileData?.condoProfile?.state
    ].filter(Boolean).join(", ") || "—";
    const displayInitials = getInitials(displayName);
    const currentAvatar = settingsAvatar || pp?.avatar_url || cp?.avatar_url || profileData?.condoProfile?.avatar_url || null;
    const memberSince = authUser
        ? new Date(
            // @ts-expect-error created_at not in AuthUser type
            authUser.created_at ?? Date.now()
        ).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        : "";

    const doneRequests = requests.filter((r) => r.status === "DONE").length;
    const openRequests = requests.filter((r) => r.status !== "DONE" && r.status !== "CANCELLED").length;
    const isLoading = profileLoading && !profileData;

    // ── Handlers ─────────────────────────────────────────────
    const handleLogout = () => { dispatch(logout()); router.push("/"); };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert("Imagem muito grande. Máximo 2 MB."); return; }
        const reader = new FileReader();
        reader.onload = (ev) => setSettingsAvatar(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsSaving(true);
        setSettingsMsg("");

        const payload: Record<string, unknown> = {
            name: settingsName,
            avatar_url: settingsAvatar ?? "",
        };

        if (authUser?.role === "PROVIDER") {
            payload.bio = settingsBio;
            payload.area = settingsArea;
            payload.radius_km = Number(settingsRadius);
            payload.availability = settingsAvailability;
            payload.company_name = settingsCompany;
            payload.document = settingsCnpj;
        } else {
            payload.cep = cepValue.replace(/\D/g, '') ? cepValue : undefined;
            payload.street = settingsStreet;
            payload.number = settingsNumber;
            payload.complement = settingsComplement;
            payload.neighborhood = settingsNeighborhood;
            payload.city = settingsCity;
            payload.state = settingsState;
            payload.location = [settingsStreet, settingsNumber, settingsNeighborhood, settingsCity, settingsState].filter(Boolean).join(", ");
        }

        if (authUser?.role === "CLIENT_CNPJ") {
            payload.cnpj = settingsCnpj;
            payload.address = [settingsStreet, settingsNumber, settingsNeighborhood, settingsCity, settingsState].filter(Boolean).join(", ");
            payload.city = settingsCity;
            payload.state = settingsState;
        }

        await dispatch(updateProfileThunk(payload));
        setSettingsSaving(false);
        setSettingsMsg("Perfil atualizado com sucesso!");
        setTimeout(() => setSettingsMsg(""), 3000);
    };

    const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const base64 = ev.target?.result as string;
                const newPhoto = await profileApi.addPortfolio(base64);
                setPortfolio(prev => [...prev, newPhoto]);
                setUploadingPhoto(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            setUploadingPhoto(false);
        }
    };

    const handleRemovePhoto = async (id: string) => {
        try {
            await profileApi.removePortfolio(id);
            setPortfolio(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const addProfessional = (name: string) => { if (!formProfessionals.includes(name)) setFormProfessionals((p) => [...p, name]); };
    const removeProfessional = (name: string) => setFormProfessionals((p) => p.filter((x) => x !== name));

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setFormPhoto(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formDesc.trim()) return;
        setSubmitting(true);
        await dispatch(createRequestThunk({
            title: formTitle.trim(),
            description: formDesc.trim(),
            urgency: formUrgency,
            photo_url: formPhoto ?? undefined,
            professionals: formProfessionals,
        }));
        setSubmitting(false);
        resetModal();
    };

    const handleDelete = async (id: string) => { await dispatch(deleteRequestThunk(id)); };

    const resetModal = () => {
        setShowCreateModal(false); setShowAddProf(false);
        setFormTitle(""); setFormDesc(""); setFormUrgency("NORMAL");
        setFormPhoto(undefined); setFormProfessionals([]);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20">

            {/* ── Top toast (perfil salvo) ── */}
            {settingsMsg && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-full bg-green-600 px-6 py-3 text-sm text-white font-medium shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {settingsMsg}
                </div>
            )}

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
                        <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1.5 ml-1">
                            <LogOut className="h-4 w-4" /> Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid gap-6 md:grid-cols-3">

                    {/* ── Sidebar ── */}
                    <aside className="md:col-span-1 space-y-4">
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative h-20 w-20 mb-4 group">
                                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-md overflow-hidden">
                                        {currentAvatar ? (
                                            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-2xl">{displayInitials}</span>
                                        )}
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold">{displayName}</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">{displayEmail}</p>
                                {displayLocation !== "—" && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />{displayLocation}
                                    </div>
                                )}
                                {memberSince && <p className="text-xs text-muted-foreground mt-1">Membro desde {memberSince}</p>}
                            </div>

                            <hr className="my-5 border-border" />

                            <nav className="space-y-1">
                                {[
                                    { tab: "services" as const, icon: AlertCircle, label: "Meus Pedidos" },
                                    { tab: "history" as const, icon: Clock, label: "Histórico" },
                                    ...(authUser?.role === "PROVIDER" ? [{ tab: "portfolio" as const, icon: Camera, label: "Portfólio" }] : []),
                                    { tab: "settings" as const, icon: Settings, label: "Configurações" },
                                ].map(({ tab, icon: Icon, label }) => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${activeTab === tab
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                                        <Icon className="h-4 w-4" />
                                        {label}
                                        {tab === "services" && openRequests > 0 && (
                                            <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary font-semibold">{openRequests}</span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[{ label: "Pedidos", value: requests.length.toString() }, { label: "Concluídos", value: doneRequests.toString() }].map(({ label, value }) => (
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
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <AlertCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold">Meus Pedidos</h1>
                                            <p className="text-sm text-muted-foreground">Gerencie seus pedidos e encontre profissionais</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm text-white font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                                        <Plus className="h-4 w-4" /> Novo Pedido
                                    </button>
                                </div>

                                {requests.length === 0 && (
                                    <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 shadow-sm">
                                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                                            <Search className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-primary">Busca de profissionais bloqueada</p>
                                            <p className="text-xs text-muted-foreground">Crie um pedido para desbloquear a busca inteligente.</p>
                                        </div>
                                    </div>
                                )}

                                {requestsLoading && requests.length === 0 && (
                                    <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                                        <p className="text-sm font-medium text-muted-foreground tracking-tight">Buscando seus pedidos...</p>
                                    </div>
                                )}

                                {!requestsLoading && requests.length === 0 && (
                                    <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center shadow-sm">
                                        <div className="mx-auto h-20 w-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
                                            <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Nenhum pedido criado</h3>
                                        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                                            Para contratar um profissional, você precisa primeiro criar um pedido descrevendo o que precisa. É rápido e fácil!
                                        </p>
                                        <button onClick={() => setShowCreateModal(true)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm text-white font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                                            <Plus className="h-4 w-4" /> Criar meu primeiro pedido
                                        </button>
                                    </div>
                                )}

                                <div className="grid gap-6">
                                    {requests.filter(r => r.status !== "DONE" && r.status !== "CANCELLED").map((s) => (
                                        <div key={s.id} className="group rounded-2xl border border-border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                                            {s.photo_url && (
                                                <div className="h-48 w-full overflow-hidden relative">
                                                    <img src={s.photo_url} alt="Pedido" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider",
                                                                urgencyConfig[s.urgency].bg,
                                                                urgencyConfig[s.urgency].color
                                                            )}>
                                                                {urgencyConfig[s.urgency].label.split(" ")[1]}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                                                {new Date(s.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{s.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{s.description}</p>
                                                    </div>
                                                    <button onClick={() => handleDelete(s.id)}
                                                        className="rounded-xl p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                                                        title="Excluir pedido">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                {s.professionals.length > 0 ? (
                                                    <div className="mt-6 pt-5 border-t border-border/60">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
                                                            <UserPlus className="h-3.5 w-3.5" />
                                                            <span>Profissionais Necessários</span>
                                                        </div>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {s.professionals.map((prof) => (
                                                                <div key={prof.profession} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3 group/item hover:border-primary/30 transition-all">
                                                                    <span className="text-sm font-bold">{prof.profession}</span>
                                                                    <Link href={`/search?service=${encodeURIComponent(prof.profession)}`}
                                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] text-white font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
                                                                        <Search className="h-3 w-3" /> Buscar
                                                                    </Link>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-6 pt-5 border-t border-border/60">
                                                        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            Nenhum profissional listado para este pedido.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB: Histórico */}
                        {activeTab === "history" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-border bg-muted/20 px-6 py-4">
                                        <h2 className="font-bold flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-primary" />
                                            Histórico de Serviços
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        {doneRequests === 0 ? (
                                            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/5 p-12 text-center">
                                                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                    <Clock className="h-8 w-8 text-muted-foreground/30" />
                                                </div>
                                                <h3 className="font-bold text-base mb-1">Histórico vazio</h3>
                                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                    Seus serviços concluídos ou cancelados aparecerão aqui no futuro.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {requests.filter((r) => r.status === "DONE" || r.status === "CANCELLED").map((s) => (
                                                    <div key={s.id} className="group rounded-xl border border-border bg-white p-5 hover:border-primary/20 transition-all flex items-center justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-bold text-base truncate">{s.title}</h3>
                                                                <span className={cn(
                                                                    "text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider",
                                                                    s.status === "DONE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                                )}>
                                                                    {s.status === "DONE" ? "Concluído" : "Cancelado"}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">{s.description}</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                                {new Date(s.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                                            </p>
                                                            <button className="text-xs font-bold text-primary hover:underline mt-1">Ver Detalhes</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: Configurações */}
                        {activeTab === "settings" && (
                            <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
                                {/* CARD 1: Dados de Identificação */}
                                <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
                                        <h2 className="font-bold flex items-center gap-2">
                                            <User className="h-5 w-5 text-primary" />
                                            Dados de Identificação
                                        </h2>
                                        {settingsMsg && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold animate-in fade-in slide-in-from-right-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                {settingsMsg}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 space-y-8">
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="relative h-24 w-24 rounded-3xl overflow-hidden bg-primary flex items-center justify-center shrink-0 shadow-lg group">
                                                {currentAvatar ? (
                                                    <img src={currentAvatar} alt="Avatar preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <span className="text-white font-bold text-3xl">{displayInitials}</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => avatarInputRef.current?.click()}
                                                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <Camera className="h-6 w-6" />
                                                </button>
                                            </div>
                                            <div className="space-y-3 flex-1">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                                                    {(authUser?.role === "PROVIDER" && settingsCompany) || authUser?.role === "CLIENT_CNPJ" ? "Logotipo da Empresa" : "Foto de Perfil"}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                                    <button type="button" onClick={() => avatarInputRef.current?.click()}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-muted transition-all active:scale-95">
                                                        {(authUser?.role === "PROVIDER" && settingsCompany) || authUser?.role === "CLIENT_CNPJ" ? "Alterar Logotipo" : "Escolher foto"}
                                                    </button>
                                                    {currentAvatar && (
                                                        <button type="button" onClick={() => setSettingsAvatar(null)}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-all active:scale-95">
                                                            Remover
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    {(authUser?.role === "PROVIDER" && settingsCompany) || authUser?.role === "CLIENT_CNPJ"
                                                        ? "Use uma imagem que represente sua marca ou empresa."
                                                        : "Recomendamos uma foto quadrada de pelo menos 400px."
                                                    }<br />
                                                    Formatos aceitos: JPG, PNG ou WEBP. Máx: 2 MB.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                                    {authUser?.role === "CLIENT_CNPJ" || (authUser?.role === "PROVIDER" && settingsCompany) ? "Nome do Condomínio / Empresa" : "Nome Completo"}
                                                </label>
                                                <input
                                                    value={settingsName}
                                                    onChange={(e) => setSettingsName(e.target.value)}
                                                    placeholder={authUser?.role === "CLIENT_CNPJ" ? "Ex: Condomínio Solar" : "Seu nome"}
                                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">E-mail</label>
                                                <input
                                                    value={displayEmail}
                                                    disabled
                                                    className="flex h-11 w-full rounded-xl border border-input bg-muted/30 px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 2: Dados Profissionais / Corporativos */}
                                {(authUser?.role === "PROVIDER" || authUser?.role === "CLIENT_CNPJ") && (
                                    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                                        <div className="border-b border-border bg-muted/20 px-6 py-4">
                                            <h2 className="font-bold flex items-center gap-2">
                                                <Briefcase className="h-5 w-5 text-primary" />
                                                Dados Profissionais / Corporativos
                                            </h2>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {/* Linha 1: Documento e Empresa */}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                                        {authUser?.role === "CLIENT_CNPJ" ? "CNPJ do Condomínio / Empresa" : "CPF / CNPJ do Condomínio / Empresa"}
                                                    </label>
                                                    <input
                                                        value={settingsCnpj}
                                                        onChange={(e) => setSettingsCnpj(formatCNPJ(e.target.value))}
                                                        placeholder={authUser?.role === "CLIENT_CNPJ" ? "00.000.000/0000-00" : "000.000.000-00 ou 00.000.000/0000-00"}
                                                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                    />
                                                </div>
                                                {authUser?.role === "PROVIDER" ? (
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Nome da Empresa (Opcional)</label>
                                                        <input
                                                            value={settingsCompany}
                                                            onChange={(e) => setSettingsCompany(e.target.value)}
                                                            placeholder="Ex: Trampio Serviços"
                                                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="hidden md:block" />
                                                )}
                                            </div>

                                            {/* Campos Exclusivos do Prestador */}
                                            {authUser?.role === "PROVIDER" && (
                                                <>
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Área de Atuação</label>
                                                            <select
                                                                value={settingsArea}
                                                                onChange={(e) => setSettingsArea(e.target.value)}
                                                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                {SERVICE_AREAS_GROUPED.map(g => (
                                                                    <optgroup key={g.category} label={g.category}>
                                                                        {g.items.map(item => <option key={item} value={item}>{item}</option>)}
                                                                    </optgroup>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Raio de Atendimento (km)</label>
                                                            <input
                                                                type="number"
                                                                value={settingsRadius}
                                                                onChange={(e) => setSettingsRadius(Number(e.target.value))}
                                                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Status de Disponibilidade</label>
                                                            <select
                                                                value={settingsAvailability}
                                                                onChange={(e) => setSettingsAvailability(e.target.value as any)}
                                                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                            >
                                                                <option value="AVAILABLE">Disponível Agora</option>
                                                                <option value="BUSY">Ocupado</option>
                                                                <option value="VACATION">Férias / Indisponível</option>
                                                            </select>
                                                        </div>
                                                        <div className="hidden md:block" />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Biografia / Descrição</label>
                                                        <textarea
                                                            value={settingsBio}
                                                            onChange={(e) => setSettingsBio(e.target.value)}
                                                            rows={4}
                                                            placeholder="Conte um pouco sobre sua experiência e serviços..."
                                                            className="flex w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* CARD 3: Localização */}
                                <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-border bg-muted/20 px-6 py-4">
                                        <h2 className="font-bold flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            Localização
                                        </h2>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid md:grid-cols-4 gap-6">
                                            <div className="md:col-span-1 space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">CEP</label>
                                                <CepField value={cepValue} onChange={handleCepChange} loading={cepLoading} error={cepError} />
                                            </div>
                                            <div className="md:col-span-3 space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Logradouro (Rua/Av)</label>
                                                <input
                                                    value={settingsStreet}
                                                    onChange={(e) => setSettingsStreet(e.target.value)}
                                                    placeholder="Ex: Rua das Flores"
                                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-4 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Número</label>
                                                <input
                                                    value={settingsNumber}
                                                    onChange={(e) => setSettingsNumber(e.target.value)}
                                                    placeholder="Ex: 100"
                                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Complemento</label>
                                                <input
                                                    value={settingsComplement}
                                                    onChange={(e) => setSettingsComplement(e.target.value)}
                                                    placeholder="Ex: Bloco A, Apto 12"
                                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Bairro</label>
                                                <input
                                                    value={settingsNeighborhood}
                                                    onChange={(e) => setSettingsNeighborhood(e.target.value)}
                                                    placeholder="Bairro"
                                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Estado (UF)</label>
                                                <input
                                                    value={settingsState}
                                                    onChange={(e) => setSettingsState(e.target.value.toUpperCase().slice(0, 2))}
                                                    placeholder="Ex: SP"
                                                    maxLength={2}
                                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Cidade</label>
                                            <input
                                                value={settingsCity}
                                                onChange={(e) => setSettingsCity(e.target.value)}
                                                placeholder="Cidade"
                                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={settingsSaving}
                                        className="flex items-center gap-2 rounded-xl bg-primary px-10 py-4 text-sm font-bold text-white hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50"
                                    >
                                        {settingsSaving ? (
                                            <><Loader2 className="h-5 w-5 animate-spin" /> Salvando...</>
                                        ) : (
                                            <><Save className="h-5 w-5" /> Salvar Alterações</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TAB: Portfólio */}
                        {activeTab === "portfolio" && authUser?.role === "PROVIDER" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
                                        <h2 className="font-bold flex items-center gap-2">
                                            <Camera className="h-5 w-5 text-primary" />
                                            Meu Portfólio
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => portfolioInputRef.current?.click()}
                                                disabled={uploadingPhoto}
                                                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20 disabled:opacity-50"
                                            >
                                                {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                Adicionar Foto
                                            </button>
                                            <input
                                                ref={portfolioInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePortfolioUpload}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {portfolio.length === 0 && !uploadingPhoto ? (
                                            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/5 p-12 text-center">
                                                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                    <Camera className="h-8 w-8 text-muted-foreground/50" />
                                                </div>
                                                <h3 className="font-bold text-base mb-1">Sua galeria está vazia</h3>
                                                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                                                    Suba fotos de serviços concluídos para passar mais confiança aos seus clientes.
                                                </p>
                                                <button
                                                    onClick={() => portfolioInputRef.current?.click()}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-primary text-primary px-5 py-2 text-sm font-bold hover:bg-primary/5 transition-all active:scale-95"
                                                >
                                                    Começar agora
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {portfolio.map((photo) => (
                                                    <div key={photo.id} className="group relative rounded-2xl overflow-hidden aspect-square border border-border bg-muted shadow-sm hover:shadow-md transition-all">
                                                        <img src={photo.url} alt="Serviço" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                                                            <button
                                                                onClick={() => handleRemovePhoto(photo.id)}
                                                                className="h-10 w-10 rounded-2xl bg-white/90 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all scale-90 group-hover:scale-100 shadow-xl backdrop-blur-sm"
                                                                title="Remover foto"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {uploadingPhoto && (
                                                    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 aspect-square flex flex-col items-center justify-center text-primary gap-3 animate-pulse">
                                                        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                                        <span className="text-[11px] font-bold uppercase tracking-widest">Enviando...</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-border bg-muted/10 px-6 py-4">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            Dica: Fotos reais aumentam em até 80% as chances de contratação.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            </main >

            {/* ── Mini popup: Add Professional ── */}
            {showAddProf && <AddProfessionalPopup onAdd={addProfessional} onClose={() => setShowAddProf(false)} />}

            {/* ── Create Service Modal ── */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                                <div>
                                    <h2 className="font-bold text-base">Novo Pedido de Serviço</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">Descreva o que você precisa</p>
                                </div>
                                <button onClick={resetModal} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleCreate} className="px-6 py-5 space-y-5 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Título <span className="text-red-500">*</span></label>
                                    <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ex: Reforma do meu apartamento" required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Descrição <span className="text-red-500">*</span></label>
                                    <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                                        placeholder="Descreva o que você precisa com detalhes..." required rows={3}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium">Profissionais necessários</label>
                                        <button type="button" onClick={() => setShowAddProf(true)}
                                            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary font-medium hover:bg-primary/10 transition">
                                            <UserPlus className="h-3.5 w-3.5" /> Adicionar profissional
                                        </button>
                                    </div>
                                    {formProfessionals.length === 0 ? (
                                        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-5 text-center text-sm text-muted-foreground">
                                            Nenhum profissional adicionado.<br /><span className="text-xs">Clique em &ldquo;Adicionar profissional&rdquo;.</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {formProfessionals.map((p) => (
                                                <span key={p} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary">
                                                    {p}
                                                    <button type="button" onClick={() => removeProfessional(p)} className="rounded-full hover:bg-primary/20 transition p-0.5"><X className="h-3 w-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Urgência</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(urgencyConfig) as Urgency[]).map((u) => (
                                            <button type="button" key={u} onClick={() => setFormUrgency(u)}
                                                className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${formUrgency === u
                                                    ? `${urgencyConfig[u].bg} ${urgencyConfig[u].color} border-current`
                                                    : "border-border text-muted-foreground hover:border-muted-foreground/40"}`}>
                                                {urgencyConfig[u].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Foto do local / problema</label>
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
                                    {formPhoto ? (
                                        <div className="relative rounded-xl overflow-hidden border border-border h-36">
                                            <img src={formPhoto} alt="Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setFormPhoto(undefined)}
                                                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"><X className="h-3.5 w-3.5" /></button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition">
                                            <ImagePlus className="h-7 w-7" />
                                            <span>Clique para adicionar uma foto</span>
                                            <span className="text-xs opacity-60">JPG, PNG, WEBP até 10 MB</span>
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3 pb-1">
                                    <button type="button" onClick={resetModal}
                                        className="flex-1 rounded-md border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition">Cancelar</button>
                                    <button type="submit" disabled={!formTitle.trim() || !formDesc.trim() || submitting}
                                        className="flex-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando...</> : "Criar Pedido"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
