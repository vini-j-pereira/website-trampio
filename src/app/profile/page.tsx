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
    Loader2,
    Save,
    User,
    Camera,
} from "lucide-react";
import { SERVICE_AREAS_GROUPED } from "@/lib/serviceAreas";
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

    const [activeTab, setActiveTab] = useState<"services" | "history" | "settings">("services");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddProf, setShowAddProf] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Create-request form
    const [formTitle, setFormTitle] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formUrgency, setFormUrgency] = useState<Urgency>("NORMAL");
    const [formPhoto, setFormPhoto] = useState<string | null>(null);
    const [formProfessionals, setFormProfessionals] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Settings form
    const cp = profileData?.clientProfile;
    const [settingsName, setSettingsName] = useState("");
    const [settingsAvatar, setSettingsAvatar] = useState<string | null>(null);
    const [settingsStreet, setSettingsStreet] = useState("");
    const [settingsNumber, setSettingsNumber] = useState("");
    const [settingsComplement, setSettingsComplement] = useState("");
    const [settingsNeighborhood, setSettingsNeighborhood] = useState("");
    const [settingsCity, setSettingsCity] = useState("");
    const [settingsState, setSettingsState] = useState("");
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState("");
    const avatarInputRef = useRef<HTMLInputElement>(null);

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
            if (cp.cep) handleCepChange(cp.cep); // init cep field without re-fetching (digits ≠ 8 after format)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cp?.id]);

    // Derived display values
    const displayName = cp?.name ?? authUser?.email?.split("@")[0] ?? "Usuário";
    const displayEmail = authUser?.email ?? "";
    const displayLocation = [settingsCity || cp?.city, settingsState || cp?.state].filter(Boolean).join(", ") || "—";
    const displayInitials = getInitials(displayName);
    const currentAvatar = settingsAvatar ?? cp?.avatar_url ?? null;
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
        await dispatch(updateProfileThunk({
            name: settingsName,
            avatar_url: settingsAvatar ?? "",
            cep: cepValue.replace(/\D/g, '') ? cepValue : undefined,
            street: settingsStreet,
            number: settingsNumber,
            complement: settingsComplement,
            neighborhood: settingsNeighborhood,
            city: settingsCity,
            state: settingsState,
            location: [settingsStreet, settingsNumber, settingsNeighborhood, settingsCity, settingsState].filter(Boolean).join(", "),
        }));
        setSettingsSaving(false);
        setSettingsMsg("Perfil atualizado com sucesso!");
        setTimeout(() => setSettingsMsg(""), 3000);
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
        setFormPhoto(null); setFormProfessionals([]);
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

            {/* ── Fixed right-side action rail ── */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
                <Link
                    href="/chat"
                    title="Chat"
                    className="relative flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
                >
                    <MessageCircle className="h-5 w-5" />
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-white border-2 border-primary" />
                </Link>
                <button
                    title="Notificações"
                    className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
                >
                    <Bell className="h-5 w-5" />
                </button>
                <div className="w-8 border-t border-primary/30" />
                <button
                    onClick={handleLogout}
                    title="Sair"
                    className="flex items-center justify-center h-12 w-12 rounded-full bg-white border border-primary/30 text-primary shadow-lg hover:bg-primary/5 active:scale-95 transition-all"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>

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
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-lg font-bold">Meus Pedidos</h1>
                                        <p className="text-sm text-muted-foreground mt-0.5">Crie um pedido antes de buscar profissionais</p>
                                    </div>
                                    <button onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-white font-medium hover:bg-primary/90 transition shadow-sm">
                                        <Plus className="h-4 w-4" /> Novo Pedido
                                    </button>
                                </div>

                                {requests.length === 0 && (
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

                                {requestsLoading && requests.length === 0 && (
                                    <div className="rounded-2xl border border-border bg-white p-8 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
                                    </div>
                                )}

                                {!requestsLoading && requests.length === 0 && (
                                    <div className="rounded-2xl border-2 border-dashed border-border bg-white p-12 text-center">
                                        <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <AlertCircle className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-semibold text-base mb-1">Nenhum pedido ainda</h3>
                                        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                                            Crie um pedido com os profissionais que você precisa e depois busque cada um deles.
                                        </p>
                                        <button onClick={() => setShowCreateModal(true)}
                                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-white font-medium hover:bg-primary/90 transition">
                                            <Plus className="h-4 w-4" /> Criar meu primeiro pedido
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {requests.filter(r => r.status !== "DONE" && r.status !== "CANCELLED").map((s) => (
                                        <div key={s.id} className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                                            {s.photo_url && (
                                                <div className="h-44 w-full overflow-hidden">
                                                    <img src={s.photo_url} alt="Pedido" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${urgencyConfig[s.urgency].bg} ${urgencyConfig[s.urgency].color}`}>
                                                                {urgencyConfig[s.urgency].label}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(s.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-semibold">{s.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                                                    </div>
                                                    <button onClick={() => handleDelete(s.id)}
                                                        className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {s.professionals.length > 0 ? (
                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <div className="flex items-center gap-1.5 text-xs text-green-600 mb-3">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <span className="font-medium">Profissionais necessários</span>
                                                        </div>
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            {s.professionals.map((prof) => (
                                                                <div key={prof.profession} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                                                                    <span className="text-sm font-medium">{prof.profession}</span>
                                                                    <Link href={`/search?service=${encodeURIComponent(prof.profession)}`}
                                                                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-white font-semibold hover:bg-primary/90 transition whitespace-nowrap">
                                                                        <Search className="h-3 w-3" /> Buscar <ChevronRight className="h-3 w-3" />
                                                                    </Link>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <p className="text-xs text-muted-foreground italic">Nenhum profissional adicionado.</p>
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
                            <>
                                <h1 className="text-lg font-bold">Histórico</h1>
                                {doneRequests === 0 ? (
                                    <div className="rounded-2xl border border-border bg-white shadow-sm p-8 text-center">
                                        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                        <h3 className="font-semibold mb-1">Histórico vazio</h3>
                                        <p className="text-sm text-muted-foreground">Seus serviços concluídos aparecerão aqui.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {requests.filter((r) => r.status === "DONE" || r.status === "CANCELLED").map((s) => (
                                            <div key={s.id} className="rounded-2xl border border-border bg-white shadow-sm p-5">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold">{s.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "DONE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                                        {s.status === "DONE" ? "Concluído" : "Cancelado"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* TAB: Configurações */}
                        {activeTab === "settings" && (
                            <form onSubmit={handleSaveSettings} className="rounded-2xl border border-border bg-white shadow-sm p-6 space-y-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="h-5 w-5 text-primary" />
                                    <h2 className="font-semibold">Configurações da Conta</h2>
                                </div>

                                {/* toast is rendered at top level — no inline alert needed */}

                                {/* ── Photo upload ── */}
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-2">Foto de Perfil</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0 shadow-md">
                                            {currentAvatar ? (
                                                <img src={currentAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-bold text-2xl">{displayInitials}</span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                            <button type="button" onClick={() => avatarInputRef.current?.click()}
                                                className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition">
                                                <Camera className="h-4 w-4" />
                                                {currentAvatar ? "Trocar foto" : "Enviar foto"}
                                            </button>
                                            {currentAvatar && (
                                                <button type="button" onClick={() => setSettingsAvatar(null)}
                                                    className="text-xs text-red-500 hover:underline">Remover foto</button>
                                            )}
                                            <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP. Máx. 2 MB.</p>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-border" />

                                {/* ── Basic info ── */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-muted-foreground">Informações pessoais</h3>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">Nome completo</label>
                                        <input value={settingsName} onChange={(e) => setSettingsName(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">E-mail (não editável)</label>
                                        <input value={displayEmail} readOnly
                                            className="flex h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
                                    </div>
                                </div>

                                <hr className="border-border" />

                                {/* ── Address block ── */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>

                                    {/* CEP — auto-fills the rest */}
                                    <CepField
                                        value={cepValue}
                                        onChange={handleCepChange}
                                        loading={cepLoading}
                                        error={cepError}
                                    />

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs text-muted-foreground mb-1">Logradouro</label>
                                            <input value={settingsStreet} onChange={(e) => setSettingsStreet(e.target.value)}
                                                placeholder="Rua/Av/Alameda"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted-foreground mb-1">Número</label>
                                            <input value={settingsNumber} onChange={(e) => setSettingsNumber(e.target.value)}
                                                placeholder="123"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-muted-foreground mb-1">Complemento</label>
                                            <input value={settingsComplement} onChange={(e) => setSettingsComplement(e.target.value)}
                                                placeholder="Apto, Bloco..."
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted-foreground mb-1">Bairro</label>
                                            <input value={settingsNeighborhood} onChange={(e) => setSettingsNeighborhood(e.target.value)}
                                                placeholder="Bairro"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs text-muted-foreground mb-1">Cidade</label>
                                            <input value={settingsCity} onChange={(e) => setSettingsCity(e.target.value)}
                                                placeholder="São Paulo"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted-foreground mb-1">Estado</label>
                                            <input value={settingsState} onChange={(e) => setSettingsState(e.target.value.toUpperCase().slice(0, 2))}
                                                placeholder="SP" maxLength={2}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={settingsSaving}
                                    className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm text-white font-medium hover:bg-primary/90 transition disabled:opacity-60">
                                    {settingsSaving
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                                        : <><Save className="h-4 w-4" /> Salvar alterações</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Mini popup: Add Professional ── */}
            {showAddProf && <AddProfessionalPopup onAdd={addProfessional} onClose={() => setShowAddProf(false)} />}

            {/* ── Create Service Modal ── */}
            {showCreateModal && (
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
                                        <button type="button" onClick={() => setFormPhoto(null)}
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
            )}
        </div>
    );
}
