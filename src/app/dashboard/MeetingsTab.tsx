"use client"

import { useState } from "react"
import { useLocalStorage } from "./useLocalStorage"
import { Plus, X, FileText, Pencil, Trash2, Check, Download, Users, Calendar, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type MeetingType = "Ordinária" | "Extraordinária" | "Assembleia Geral"
export type MeetingStatus = "Agendada" | "Realizada" | "Cancelada"

export interface Meeting {
    id: string
    title: string
    type: MeetingType
    date: string
    time: string
    location: string
    agenda: string
    attendees: string
    minutes: string   // ata completa
    summary: string   // resumo executivo
    status: MeetingStatus
}

const TYPE_COLORS: Record<MeetingType, string> = {
    "Ordinária": "bg-blue-100 text-blue-700",
    "Extraordinária": "bg-orange-100 text-orange-700",
    "Assembleia Geral": "bg-purple-100 text-purple-700",
}

const STATUS_COLORS: Record<MeetingStatus, string> = {
    "Agendada": "bg-sky-100 text-sky-700",
    "Realizada": "bg-green-100 text-green-700",
    "Cancelada": "bg-red-100 text-red-700",
}

function exportMinutes(meeting: Meeting) {
    const lines = [
        `ATA DE REUNIÃO`,
        `${"=".repeat(60)}`,
        ``,
        `Título:        ${meeting.title}`,
        `Tipo:          ${meeting.type}`,
        `Data:          ${new Date(meeting.date + "T00:00").toLocaleDateString("pt-BR")}`,
        `Horário:       ${meeting.time}`,
        `Local:         ${meeting.location}`,
        `Situação:      ${meeting.status}`,
        ``,
        `PARTICIPANTES`,
        `-`.repeat(40),
        meeting.attendees || "(não informado)",
        ``,
        `PAUTA`,
        `-`.repeat(40),
        meeting.agenda || "(não informada)",
        ``,
        `RESUMO EXECUTIVO`,
        `-`.repeat(40),
        meeting.summary || "(não preenchido)",
        ``,
        `ATA COMPLETA`,
        `-`.repeat(40),
        meeting.minutes || "(não preenchida)",
        ``,
        `${"=".repeat(60)}`,
        `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    ].join("\n")

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ata-${meeting.title.replace(/\s+/g, "-").toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
}

// ─── Meeting Modal ────────────────────────────────────────────────────────────

function MeetingModal({
    meeting,
    onClose,
    onSave,
    onDelete,
}: {
    meeting: Meeting | null
    onClose: () => void
    onSave: (m: Meeting) => void
    onDelete?: (id: string) => void
}) {
    const blank: Omit<Meeting, "id"> = {
        title: "", type: "Ordinária", date: "", time: "", location: "",
        agenda: "", attendees: "", minutes: "", summary: "", status: "Agendada",
    }
    const [form, setForm] = useState<Omit<Meeting, "id">>(
        meeting ? { ...meeting } : blank
    )
    const [tab, setTab] = useState<"info" | "ata">("info")

    function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
        setForm(p => ({ ...p, [k]: v }))
    }

    function handleSave() {
        if (!form.title || !form.date) return
        onSave({ ...form, id: meeting?.id || crypto.randomUUID() })
    }

    const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
    const tabBtnCls = (active: boolean) => cn(
        "flex-1 py-2 text-sm font-medium rounded-lg transition",
        active ? "bg-primary text-white shadow" : "text-muted-foreground hover:bg-muted"
    )

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">
                        {meeting ? "Editar Reunião" : "Nova Reunião"}
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tab switcher */}
                <div className="px-6 pt-4 flex gap-2 bg-muted/30">
                    <button className={tabBtnCls(tab === "info")} onClick={() => setTab("info")}>
                        Informações
                    </button>
                    <button className={tabBtnCls(tab === "ata")} onClick={() => setTab("ata")}>
                        Ata & Resumo
                    </button>
                </div>

                <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
                    {tab === "info" ? (
                        <>
                            <input className={inputCls} placeholder="Título da reunião *" value={form.title} onChange={e => set("title", e.target.value)} />

                            {/* Tipo */}
                            <div className="flex gap-1">
                                {(["Ordinária", "Extraordinária", "Assembleia Geral"] as MeetingType[]).map(t => (
                                    <button key={t} onClick={() => set("type", t)}
                                        className={cn("flex-1 py-1.5 rounded-lg text-xs font-medium border transition",
                                            form.type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Status */}
                            <div className="flex gap-1">
                                {(["Agendada", "Realizada", "Cancelada"] as MeetingStatus[]).map(s => (
                                    <button key={s} onClick={() => set("status", s)}
                                        className={cn("flex-1 py-1.5 rounded-lg text-xs font-medium border transition",
                                            form.status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-muted-foreground mb-1">Data *</label>
                                    <input type="date" className={inputCls} value={form.date} onChange={e => set("date", e.target.value)} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-muted-foreground mb-1">Horário</label>
                                    <input type="time" className={inputCls} value={form.time} onChange={e => set("time", e.target.value)} />
                                </div>
                            </div>

                            <input className={inputCls} placeholder="Local (ex: Salão de festas)" value={form.location} onChange={e => set("location", e.target.value)} />
                            <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Pauta" value={form.agenda} onChange={e => set("agenda", e.target.value)} />
                            <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Participantes" value={form.attendees} onChange={e => set("attendees", e.target.value)} />
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Resumo Executivo</label>
                                <textarea className={`${inputCls} resize-none`} rows={3}
                                    placeholder="Principais decisões e pontos discutidos..."
                                    value={form.summary} onChange={e => set("summary", e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Ata Completa</label>
                                <textarea className={`${inputCls} resize-none`} rows={8}
                                    placeholder="Ata detalhada da reunião..."
                                    value={form.minutes} onChange={e => set("minutes", e.target.value)} />
                            </div>
                        </>
                    )}
                </div>

                <div className="px-6 pb-6 flex justify-between items-center gap-2">
                    {meeting && onDelete && (
                        <button onClick={() => onDelete(meeting.id)}
                            className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-700 transition">
                            <Trash2 size={14} /> Excluir
                        </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        {meeting && (
                            <button onClick={() => exportMinutes(meeting)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition">
                                <Download className="h-4 w-4" /> Exportar Ata
                            </button>
                        )}
                        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition">
                            Cancelar
                        </button>
                        <button onClick={handleSave}
                            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-1.5">
                            <Check className="h-4 w-4" /> Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Meetings Tab ─────────────────────────────────────────────────────────────

export function MeetingsTab() {
    const [meetings, setMeetings] = useLocalStorage<Meeting[]>("trampio:meetings", [])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<Meeting | null>(null)
    const [typeFilter, setTypeFilter] = useState<MeetingType | "Todas">("Todas")
    const [statusFilter, setStatusFilter] = useState<MeetingStatus | "Todas">("Todas")

    function saveMeeting(m: Meeting) {
        setMeetings(prev =>
            prev.find(x => x.id === m.id) ? prev.map(x => x.id === m.id ? m : x) : [...prev, m]
        )
        setShowModal(false)
        setEditing(null)
    }

    function deleteMeeting(id: string) {
        setMeetings(prev => prev.filter(x => x.id !== id))
        setShowModal(false)
        setEditing(null)
    }

    function openEdit(m: Meeting) {
        setEditing(m)
        setShowModal(true)
    }

    const filtered = meetings
        .filter(m => typeFilter === "Todas" || m.type === typeFilter)
        .filter(m => statusFilter === "Todas" || m.status === statusFilter)
        .sort((a, b) => b.date.localeCompare(a.date))

    const upcoming = meetings.filter(m => m.status === "Agendada").sort((a, b) => a.date.localeCompare(b.date))[0]

    return (
        <div className="space-y-4">

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total de reuniões", value: meetings.length, color: "text-foreground" },
                    { label: "Realizadas", value: meetings.filter(m => m.status === "Realizada").length, color: "text-green-600" },
                    { label: "Agendadas", value: meetings.filter(m => m.status === "Agendada").length, color: "text-sky-600" },
                ].map(c => (
                    <div key={c.label} className="bg-white border border-border rounded-2xl shadow-sm px-4 py-3">
                        <p className="text-[11px] text-muted-foreground">{c.label}</p>
                        <p className={cn("text-2xl font-bold", c.color)}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Próxima reunião */}
            {upcoming && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <div>
                        <p className="text-xs text-primary font-semibold">Próxima reunião</p>
                        <p className="text-sm font-medium">{upcoming.title} — {new Date(upcoming.date + "T00:00").toLocaleDateString("pt-BR")} {upcoming.time && `às ${upcoming.time}`}</p>
                    </div>
                </div>
            )}

            {/* Filters + New button */}
            <div className="bg-white border border-border rounded-2xl shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {/* Type filter */}
                        <div className="relative">
                            <select value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value as MeetingType | "Todas")}
                                className="appearance-none border border-border rounded-lg px-3 py-1.5 text-xs pr-7 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                <option value="Todas">Todos os tipos</option>
                                {(["Ordinária", "Extraordinária", "Assembleia Geral"] as MeetingType[]).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Status filter */}
                        <div className="relative">
                            <select value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as MeetingStatus | "Todas")}
                                className="appearance-none border border-border rounded-lg px-3 py-1.5 text-xs pr-7 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                <option value="Todas">Todas as situações</option>
                                {(["Agendada", "Realizada", "Cancelada"] as MeetingStatus[]).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <button onClick={() => { setEditing(null); setShowModal(true) }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition shadow-sm">
                        <Plus className="h-4 w-4" /> Nova Reunião
                    </button>
                </div>

                {/* List */}
                <div className="mt-4 space-y-2">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Nenhuma reunião encontrada.</p>
                            <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Reunião" para começar.</p>
                        </div>
                    ) : (
                        filtered.map(m => (
                            <div key={m.id}
                                className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition cursor-pointer"
                                onClick={() => openEdit(m)}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold">{m.title}</p>
                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", TYPE_COLORS[m.type])}>{m.type}</span>
                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[m.status])}>{m.status}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(m.date + "T00:00").toLocaleDateString("pt-BR")}
                                        {m.time && ` às ${m.time}`}
                                        {m.location && ` · ${m.location}`}
                                    </p>
                                    {m.summary && <p className="text-xs text-muted-foreground mt-1 truncate">{m.summary}</p>}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    {m.status === "Realizada" && (
                                        <button onClick={e => { e.stopPropagation(); exportMinutes(m) }}
                                            title="Exportar Ata"
                                            className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary">
                                            <Download className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button onClick={e => { e.stopPropagation(); openEdit(m) }}
                                        className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <MeetingModal
                    meeting={editing}
                    onClose={() => { setShowModal(false); setEditing(null) }}
                    onSave={saveMeeting}
                    onDelete={deleteMeeting}
                />
            )}
        </div>
    )
}
