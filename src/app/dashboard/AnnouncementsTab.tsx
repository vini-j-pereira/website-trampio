"use client"

import { useState } from "react"
import { useLocalStorage } from "./useLocalStorage"
import { Plus, X, Trash2, Check, Megaphone, ChevronDown, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

export type AnnouncementStatus = "Rascunho" | "Enviado"
export type AnnouncementTarget = "Todos" | "Bloco A" | "Bloco B" | "Bloco C" | "Unidade específica"

export interface Announcement {
    id: string
    title: string
    message: string
    target: AnnouncementTarget
    unit: string
    status: AnnouncementStatus
    createdAt: string
}

const STATUS_COLORS: Record<AnnouncementStatus, string> = {
    "Rascunho": "bg-amber-100 text-amber-700",
    "Enviado": "bg-green-100 text-green-700",
}

function AnnouncementModal({
    ann,
    onClose,
    onSave,
    onDelete,
}: {
    ann: Announcement | null
    onClose: () => void
    onSave: (a: Announcement) => void
    onDelete?: (id: string) => void
}) {
    const blank: Omit<Announcement, "id"> = {
        title: "", message: "", target: "Todos", unit: "",
        status: "Rascunho", createdAt: new Date().toISOString().slice(0, 10),
    }
    const [form, setForm] = useState<Omit<Announcement, "id">>(ann ? { ...ann } : blank)

    function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
        setForm(p => ({ ...p, [k]: v }))
    }

    function handleSave(status: AnnouncementStatus) {
        if (!form.title || !form.message) return
        onSave({ ...form, status, id: ann?.id || crypto.randomUUID() })
    }

    const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">{ann ? "Editar Comunicado" : "Novo Comunicado"}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-3">
                    <input className={inputCls} placeholder="Título *" value={form.title} onChange={e => set("title", e.target.value)} />

                    <div className="relative">
                        <select value={form.target} onChange={e => set("target", e.target.value as AnnouncementTarget)}
                            className="w-full appearance-none border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white pr-9">
                            {(["Todos", "Bloco A", "Bloco B", "Bloco C", "Unidade específica"] as AnnouncementTarget[]).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>

                    {form.target === "Unidade específica" && (
                        <input className={inputCls} placeholder="Ex: Apto 101 Bloco A"
                            value={form.unit} onChange={e => set("unit", e.target.value)} />
                    )}

                    <textarea className={`${inputCls} resize-none`} rows={5}
                        placeholder="Mensagem do comunicado *"
                        value={form.message} onChange={e => set("message", e.target.value)} />
                </div>

                <div className="px-6 pb-6 flex justify-between items-center gap-2">
                    {ann && onDelete && (
                        <button onClick={() => onDelete(ann.id)} className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-700 transition">
                            <Trash2 size={14} /> Excluir
                        </button>
                    )}
                    <div className="flex gap-2 ml-auto flex-wrap">
                        <button onClick={onClose} className="px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted transition">Cancelar</button>
                        <button onClick={() => handleSave("Rascunho")}
                            className="px-3 py-2 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 text-sm font-medium hover:bg-amber-100 transition">
                            Salvar Rascunho
                        </button>
                        <button onClick={() => handleSave("Enviado")}
                            className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-1.5">
                            <Check className="h-4 w-4" /> Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function AnnouncementsTab() {
    const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>("trampio:announcements", [])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<Announcement | null>(null)
    const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | "Todos">("Todos")

    function saveAnn(a: Announcement) {
        setAnnouncements(prev =>
            prev.find(x => x.id === a.id) ? prev.map(x => x.id === a.id ? a : x) : [...prev, a]
        )
        setShowModal(false); setEditing(null)
    }

    function deleteAnn(id: string) {
        setAnnouncements(prev => prev.filter(x => x.id !== id))
        setShowModal(false); setEditing(null)
    }

    const filtered = announcements
        .filter(a => statusFilter === "Todos" || a.status === statusFilter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total", value: announcements.length, color: "text-foreground" },
                    { label: "Enviados", value: announcements.filter(a => a.status === "Enviado").length, color: "text-green-600" },
                    { label: "Rascunhos", value: announcements.filter(a => a.status === "Rascunho").length, color: "text-amber-600" },
                ].map(c => (
                    <div key={c.label} className="bg-white border border-border rounded-2xl shadow-sm px-4 py-3">
                        <p className="text-[11px] text-muted-foreground">{c.label}</p>
                        <p className={cn("text-2xl font-bold", c.color)}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-border rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Comunicados</span>

                        {/* Status filter pills */}
                        <div className="flex gap-1 ml-2">
                            {(["Todos", "Enviado", "Rascunho"] as const).map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition",
                                        statusFilter === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => { setEditing(null); setShowModal(true) }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition shadow-sm">
                        <Plus className="h-4 w-4" /> Novo Comunicado
                    </button>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Nenhum comunicado ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(a => (
                            <div key={a.id} className="p-3 rounded-xl border border-border hover:bg-muted/30 transition">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold">{a.title}</p>
                                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[a.status])}>
                                                {a.status}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                {a.target}{a.target === "Unidade específica" && a.unit ? ` · ${a.unit}` : ""}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {new Date(a.createdAt + "T00:00").toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                    <button onClick={() => { setEditing(a); setShowModal(true) }}
                                        className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary shrink-0">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <AnnouncementModal
                    ann={editing}
                    onClose={() => { setShowModal(false); setEditing(null) }}
                    onSave={saveAnn}
                    onDelete={deleteAnn}
                />
            )}
        </div>
    )
}
