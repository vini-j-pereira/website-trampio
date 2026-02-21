"use client"

import { useState } from "react"
import { useLocalStorage } from "./useLocalStorage"
import { Plus, X, Trash2, Check, Star, Phone, Pencil, History, Heart, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

export type ServiceCategory =
    | "Elétrica" | "Hidráulica" | "Pintura" | "Limpeza" | "Jardinagem"
    | "Segurança" | "Elevadores" | "TI" | "Outros"

export interface FavoriteProvider {
    id: string
    name: string
    category: ServiceCategory
    phone: string
    email: string
    notes: string
    rating: number
    isFavorite: boolean
}

export interface ServiceHistory {
    id: string
    title: string
    providerId: string | null
    providerName: string
    category: ServiceCategory
    date: string
    cost: number
    status: "Concluído" | "Em andamento" | "Cancelado"
    notes: string
}

type ProviderModalState = { open: true; data: FavoriteProvider | null } | { open: false }
type HistoryModalState = { open: true; data: ServiceHistory | null } | { open: false }

const CAT_LIST: ServiceCategory[] = [
    "Elétrica", "Hidráulica", "Pintura", "Limpeza", "Jardinagem",
    "Segurança", "Elevadores", "TI", "Outros",
]

const CAT_COLORS: Record<ServiceCategory, string> = {
    Elétrica: "bg-yellow-100 text-yellow-700",
    Hidráulica: "bg-blue-100 text-blue-700",
    Pintura: "bg-pink-100 text-pink-700",
    Limpeza: "bg-teal-100 text-teal-700",
    Jardinagem: "bg-green-100 text-green-700",
    Segurança: "bg-red-100 text-red-700",
    Elevadores: "bg-purple-100 text-purple-700",
    TI: "bg-indigo-100 text-indigo-700",
    Outros: "bg-gray-100 text-gray-600",
}

const HIST_STATUS_COLORS: Record<ServiceHistory["status"], string> = {
    "Concluído": "bg-green-100 text-green-700",
    "Em andamento": "bg-orange-100 text-orange-700",
    "Cancelado": "bg-red-100 text-red-700",
}

function StarRating({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => onChange?.(n)}
                    className={cn("transition", onChange ? "hover:scale-110 cursor-pointer" : "cursor-default")}>
                    <Star className={cn("h-4 w-4", n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
                </button>
            ))}
        </div>
    )
}

// ─── Provider Modal ───────────────────────────────────────────────────────────

function ProviderModal({
    provider, onClose, onSave, onDelete,
}: {
    provider: FavoriteProvider | null
    onClose: () => void
    onSave: (p: FavoriteProvider) => void
    onDelete?: (id: string) => void
}) {
    const blank: Omit<FavoriteProvider, "id"> = {
        name: "", category: "Outros", phone: "", email: "", notes: "", rating: 5, isFavorite: true,
    }
    const [form, setForm] = useState<Omit<FavoriteProvider, "id">>(provider ? { ...provider } : blank)

    function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
        setForm(p => ({ ...p, [k]: v }))
    }

    function handleSave() {
        if (!form.name) return
        onSave({ ...form, id: provider?.id || crypto.randomUUID() })
    }

    const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">{provider ? "Editar Prestador" : "Novo Prestador"}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-3">
                    <input className={inputCls} placeholder="Nome do prestador *" value={form.name} onChange={e => set("name", e.target.value)} />

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <select value={form.category} onChange={e => set("category", e.target.value as ServiceCategory)}
                                className="w-full appearance-none border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white">
                                {CAT_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-muted-foreground mb-1">Avaliação</label>
                            <StarRating value={form.rating} onChange={n => set("rating", n)} />
                        </div>
                    </div>

                    <input className={inputCls} placeholder="Telefone / WhatsApp" value={form.phone} onChange={e => set("phone", e.target.value)} />
                    <input className={inputCls} placeholder="E-mail" value={form.email} onChange={e => set("email", e.target.value)} />
                    <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Observações / especialidades" value={form.notes} onChange={e => set("notes", e.target.value)} />

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.isFavorite} onChange={e => set("isFavorite", e.target.checked)} className="accent-primary" />
                        <span className="text-sm">Marcar como favorito</span>
                    </label>
                </div>
                <div className="px-6 pb-6 flex justify-between items-center gap-2">
                    {provider && onDelete && (
                        <button onClick={() => onDelete(provider.id)} className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-700 transition">
                            <Trash2 size={14} /> Excluir
                        </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition">Cancelar</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-1.5">
                            <Check className="h-4 w-4" /> Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Service History Modal ────────────────────────────────────────────────────

function HistoryModal({
    entry, providers, onClose, onSave, onDelete,
}: {
    entry: ServiceHistory | null
    providers: FavoriteProvider[]
    onClose: () => void
    onSave: (h: ServiceHistory) => void
    onDelete?: (id: string) => void
}) {
    const blank: Omit<ServiceHistory, "id"> = {
        title: "", providerId: null, providerName: "", category: "Outros",
        date: new Date().toISOString().slice(0, 10), cost: 0,
        status: "Concluído", notes: "",
    }
    const [form, setForm] = useState<Omit<ServiceHistory, "id">>(entry ? { ...entry } : blank)

    function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
        setForm(p => ({ ...p, [k]: v }))
    }

    function handleSave() {
        if (!form.title) return
        onSave({ ...form, id: entry?.id || crypto.randomUUID() })
    }

    const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">{entry ? "Editar Serviço" : "Registrar Serviço"}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-3">
                    <input className={inputCls} placeholder="Descrição do serviço *" value={form.title} onChange={e => set("title", e.target.value)} />

                    <div className="relative">
                        <select
                            value={form.providerId ?? ""}
                            onChange={e => {
                                const pid = e.target.value
                                const found = providers.find(p => p.id === pid)
                                set("providerId", pid || null)
                                set("providerName", found?.name ?? "")
                                if (found) set("category", found.category)
                            }}
                            className="w-full appearance-none border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white">
                            <option value="">Prestador não cadastrado</option>
                            {providers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                        </select>
                    </div>

                    {!form.providerId && (
                        <input className={inputCls} placeholder="Nome do prestador (avulso)" value={form.providerName} onChange={e => set("providerName", e.target.value)} />
                    )}

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <select value={form.category} onChange={e => set("category", e.target.value as ServiceCategory)}
                                className="w-full appearance-none border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white">
                                {CAT_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <select value={form.status} onChange={e => set("status", e.target.value as ServiceHistory["status"])}
                                className="w-full appearance-none border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white">
                                {(["Concluído", "Em andamento", "Cancelado"] as const).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">Data</label>
                            <input type="date" className={inputCls} value={form.date} onChange={e => set("date", e.target.value)} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">Custo (R$)</label>
                            <input type="number" className={inputCls} placeholder="0" value={form.cost || ""} onChange={e => set("cost", Number(e.target.value))} />
                        </div>
                    </div>

                    <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Observações" value={form.notes} onChange={e => set("notes", e.target.value)} />
                </div>
                <div className="px-6 pb-6 flex justify-between items-center gap-2">
                    {entry && onDelete && (
                        <button onClick={() => onDelete(entry.id)} className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-700 transition">
                            <Trash2 size={14} /> Excluir
                        </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition">Cancelar</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-1.5">
                            <Check className="h-4 w-4" /> Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Providers Tab ────────────────────────────────────────────────────────────

export function ProvidersTab() {
    const [providers, setProviders] = useLocalStorage<FavoriteProvider[]>("trampio:providers", [])
    const [history, setHistory] = useLocalStorage<ServiceHistory[]>("trampio:serviceHistory", [])
    const [providerModal, setProviderModal] = useState<ProviderModalState>({ open: false })
    const [historyModal, setHistoryModal] = useState<HistoryModalState>({ open: false })
    const [activeSection, setActiveSection] = useState<"favorites" | "history">("favorites")
    const [search, setSearch] = useState("")
    const [catFilter, setCatFilter] = useState<ServiceCategory | "Todos">("Todos")

    function saveProvider(p: FavoriteProvider) {
        setProviders(prev => prev.find(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p])
        setProviderModal({ open: false })
    }
    function deleteProvider(id: string) {
        setProviders(prev => prev.filter(x => x.id !== id))
        setProviderModal({ open: false })
    }
    function saveHistory(h: ServiceHistory) {
        setHistory(prev => prev.find(x => x.id === h.id) ? prev.map(x => x.id === h.id ? h : x) : [...prev, h])
        setHistoryModal({ open: false })
    }
    function deleteHistory(id: string) {
        setHistory(prev => prev.filter(x => x.id !== id))
        setHistoryModal({ open: false })
    }

    const filteredProviders = providers
        .filter(p => catFilter === "Todos" || p.category === catFilter)
        .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.rating - a.rating)

    const filteredHistory = history
        .filter(h => catFilter === "Todos" || h.category === catFilter)
        .filter(h => !search || h.title.toLowerCase().includes(search.toLowerCase()) || h.providerName.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date))

    const totalCost = history.filter(h => h.status === "Concluído").reduce((s, h) => s + h.cost, 0)

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Prestadores cadastrados", value: providers.length, color: "text-foreground" },
                    { label: "Favoritos", value: providers.filter(p => p.isFavorite).length, color: "text-amber-600" },
                    { label: "Custo total (serviços)", value: `R$ ${totalCost.toLocaleString("pt-BR")}`, color: "text-red-600", small: true },
                ].map(c => (
                    <div key={c.label} className="bg-white border border-border rounded-2xl shadow-sm px-4 py-3">
                        <p className="text-[11px] text-muted-foreground">{c.label}</p>
                        <p className={cn("font-bold", c.small ? "text-base mt-1" : "text-2xl", c.color)}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Section tabs */}
            <div className="flex gap-2 bg-muted/40 rounded-xl p-1 border border-border">
                <button onClick={() => setActiveSection("favorites")}
                    className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition",
                        activeSection === "favorites" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>
                    <Heart className="h-4 w-4" /> Prestadores Favoritos
                </button>
                <button onClick={() => setActiveSection("history")}
                    className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition",
                        activeSection === "history" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>
                    <History className="h-4 w-4" /> Histórico de Serviços
                </button>
            </div>

            {/* Filters + search */}
            <div className="bg-white border border-border rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex gap-2 flex-wrap items-center justify-between">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <button onClick={() => setCatFilter("Todos")}
                            className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition",
                                catFilter === "Todos" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                            Todos
                        </button>
                        {CAT_LIST.map(c => (
                            <button key={c} onClick={() => setCatFilter(c)}
                                className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition",
                                    catFilter === c ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Favorites ── */}
                {activeSection === "favorites" && (
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{filteredProviders.length} prestador{filteredProviders.length !== 1 ? "es" : ""}</p>
                            <button onClick={() => setProviderModal({ open: true, data: null })}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition shadow-sm">
                                <Plus className="h-4 w-4" /> Adicionar Prestador
                            </button>
                        </div>

                        {filteredProviders.length === 0 ? (
                            <div className="py-10 text-center">
                                <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">Nenhum prestador cadastrado.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {filteredProviders.map(p => (
                                    <div key={p.id} className="border border-border rounded-xl p-3 hover:bg-muted/20 transition">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold truncate">{p.name}</p>
                                                    {p.isFavorite && <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                                                </div>
                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-0.5", CAT_COLORS[p.category])}>
                                                    {p.category}
                                                </span>
                                                <div className="mt-1"><StarRating value={p.rating} /></div>
                                                {p.phone && (
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                        <Phone className="h-3 w-3" /> {p.phone}
                                                    </p>
                                                )}
                                                {p.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.notes}</p>}
                                            </div>
                                            <button onClick={() => setProviderModal({ open: true, data: p })}
                                                className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary shrink-0">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── History ── */}
                {activeSection === "history" && (
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{filteredHistory.length} registro{filteredHistory.length !== 1 ? "s" : ""}</p>
                            <button onClick={() => setHistoryModal({ open: true, data: null })}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition shadow-sm">
                                <Plus className="h-4 w-4" /> Registrar Serviço
                            </button>
                        </div>

                        {filteredHistory.length === 0 ? (
                            <div className="py-10 text-center">
                                <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">Nenhum serviço registrado.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredHistory.map(h => (
                                    <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-medium truncate">{h.title}</p>
                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", HIST_STATUS_COLORS[h.status])}>{h.status}</span>
                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", CAT_COLORS[h.category])}>{h.category}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {h.providerName || "Prestador não informado"} · {new Date(h.date + "T00:00").toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        {h.cost > 0 && (
                                            <p className="text-sm font-bold text-foreground shrink-0">R$ {h.cost.toLocaleString("pt-BR")}</p>
                                        )}
                                        <button onClick={() => setHistoryModal({ open: true, data: h })}
                                            className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary shrink-0">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {providerModal.open && (
                <ProviderModal
                    provider={providerModal.data}
                    onClose={() => setProviderModal({ open: false })}
                    onSave={saveProvider}
                    onDelete={deleteProvider}
                />
            )}
            {historyModal.open && (
                <HistoryModal
                    entry={historyModal.data}
                    providers={providers}
                    onClose={() => setHistoryModal({ open: false })}
                    onSave={saveHistory}
                    onDelete={deleteHistory}
                />
            )}
        </div>
    )
}
