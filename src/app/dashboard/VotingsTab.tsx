"use client"

import { useState } from "react"
import { useLocalStorage } from "./useLocalStorage"
import { Plus, X, Trash2, Check, Vote, ChevronDown, Pencil, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type VotingStatus = "Aberta" | "Encerrada" | "Rascunho"
export type VotingOption = { id: string; label: string; votes: number }

export interface Voting {
    id: string
    title: string
    description: string
    status: VotingStatus
    startDate: string
    endDate: string
    options: VotingOption[]
    totalUnits: number
}

const STATUS_COLORS: Record<VotingStatus, string> = {
    "Aberta": "bg-green-100 text-green-700",
    "Encerrada": "bg-gray-100 text-gray-600",
    "Rascunho": "bg-amber-100 text-amber-700",
}

// ─── Voting Modal ─────────────────────────────────────────────────────────────

function VotingModal({
    voting,
    onClose,
    onSave,
    onDelete,
}: {
    voting: Voting | null
    onClose: () => void
    onSave: (v: Voting) => void
    onDelete?: (id: string) => void
}) {
    const blank: Omit<Voting, "id"> = {
        title: "", description: "", status: "Rascunho",
        startDate: "", endDate: "", options: [
            { id: crypto.randomUUID(), label: "Sim", votes: 0 },
            { id: crypto.randomUUID(), label: "Não", votes: 0 },
        ], totalUnits: 0,
    }
    const [form, setForm] = useState<Omit<Voting, "id">>(voting ? { ...voting } : blank)
    const [newOpt, setNewOpt] = useState("")

    function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
        setForm(p => ({ ...p, [k]: v }))
    }

    function addOption() {
        if (!newOpt.trim()) return
        set("options", [...form.options, { id: crypto.randomUUID(), label: newOpt.trim(), votes: 0 }])
        setNewOpt("")
    }

    function removeOption(id: string) {
        set("options", form.options.filter(o => o.id !== id))
    }

    function handleSave() {
        if (!form.title || form.options.length < 2) return
        onSave({ ...form, id: voting?.id || crypto.randomUUID() })
    }

    const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">{voting ? "Editar Votação" : "Nova Votação"}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
                </div>

                <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
                    <input className={inputCls} placeholder="Título da votação *" value={form.title} onChange={e => set("title", e.target.value)} />
                    <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Descrição / pauta" value={form.description} onChange={e => set("description", e.target.value)} />

                    {/* Status */}
                    <div className="flex gap-1">
                        {(["Rascunho", "Aberta", "Encerrada"] as VotingStatus[]).map(s => (
                            <button key={s} onClick={() => set("status", s)}
                                className={cn("flex-1 py-1.5 rounded-lg text-xs font-medium border transition",
                                    form.status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">Data início</label>
                            <input type="date" className={inputCls} value={form.startDate} onChange={e => set("startDate", e.target.value)} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">Data fim</label>
                            <input type="date" className={inputCls} value={form.endDate} onChange={e => set("endDate", e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">Total de unidades votantes</label>
                        <input type="number" className={inputCls} placeholder="Ex: 48" value={form.totalUnits || ""} onChange={e => set("totalUnits", Number(e.target.value))} />
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Opções de voto *</label>
                        <div className="space-y-1.5 mb-2">
                            {form.options.map(opt => (
                                <div key={opt.id} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                                    <span className="flex-1 text-sm">{opt.label}</span>
                                    {form.status !== "Encerrada" && (
                                        <input type="number" min={0} value={opt.votes}
                                            onChange={e => set("options", form.options.map(o => o.id === opt.id ? { ...o, votes: Number(e.target.value) } : o))}
                                            className="w-16 border border-border rounded-lg px-2 py-1 text-xs text-center focus:outline-none" placeholder="Votos" />
                                    )}
                                    {form.status === "Encerrada" && (
                                        <span className="text-xs font-bold text-primary">{opt.votes} votos</span>
                                    )}
                                    <button onClick={() => removeOption(opt.id)} className="text-muted-foreground hover:text-red-500 transition">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input className="flex-1 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="Nova opção..." value={newOpt} onChange={e => setNewOpt(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") addOption() }} />
                            <button onClick={addOption} className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition">
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex justify-between items-center gap-2">
                    {voting && onDelete && (
                        <button onClick={() => onDelete(voting.id)} className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-700 transition">
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

// ─── Result Bar ───────────────────────────────────────────────────────────────

function ResultBar({ option, total }: { option: VotingOption; total: number }) {
    const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="font-medium">{option.label}</span>
                <span className="text-muted-foreground">{option.votes} votos · {pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
}

// ─── Votings Tab ──────────────────────────────────────────────────────────────

export function VotingsTab() {
    const [votings, setVotings] = useLocalStorage<Voting[]>("trampio:votings", [])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<Voting | null>(null)
    const [statusFilter, setStatusFilter] = useState<VotingStatus | "Todas">("Todas")
    const [expanded, setExpanded] = useState<string | null>(null)

    function saveVoting(v: Voting) {
        setVotings(prev => prev.find(x => x.id === v.id) ? prev.map(x => x.id === v.id ? v : x) : [...prev, v])
        setShowModal(false); setEditing(null)
    }

    function deleteVoting(id: string) {
        setVotings(prev => prev.filter(x => x.id !== id))
        setShowModal(false); setEditing(null)
    }

    const filtered = votings
        .filter(v => statusFilter === "Todas" || v.status === statusFilter)
        .sort((a, b) => b.startDate.localeCompare(a.startDate))

    const openCount = votings.filter(v => v.status === "Aberta").length

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total de votações", value: votings.length, color: "text-foreground" },
                    { label: "Abertas", value: openCount, color: "text-green-600" },
                    { label: "Encerradas", value: votings.filter(v => v.status === "Encerrada").length, color: "text-gray-500" },
                ].map(c => (
                    <div key={c.label} className="bg-white border border-border rounded-2xl shadow-sm px-4 py-3">
                        <p className="text-[11px] text-muted-foreground">{c.label}</p>
                        <p className={cn("text-2xl font-bold", c.color)}>{c.value}</p>
                    </div>
                ))}
            </div>

            {openCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Vote className="h-5 w-5 text-green-600 shrink-0" />
                    <p className="text-sm font-medium text-green-700">
                        {openCount} votação{openCount > 1 ? "ões" : ""} em aberto aguardando participação.
                    </p>
                </div>
            )}

            <div className="bg-white border border-border rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <BarChart2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Votações</span>
                        <div className="flex gap-1 ml-1">
                            {(["Todas", "Aberta", "Encerrada", "Rascunho"] as const).map(s => (
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
                        <Plus className="h-4 w-4" /> Nova Votação
                    </button>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <Vote className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Nenhuma votação encontrada.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(v => {
                            const totalVotes = v.options.reduce((s, o) => s + o.votes, 0)
                            const quorum = v.totalUnits > 0 ? Math.round((totalVotes / v.totalUnits) * 100) : null
                            const isExpanded = expanded === v.id
                            const winner = v.status === "Encerrada"
                                ? [...v.options].sort((a, b) => b.votes - a.votes)[0]
                                : null

                            return (
                                <div key={v.id} className="border border-border rounded-xl overflow-hidden">
                                    <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30 transition"
                                        onClick={() => setExpanded(isExpanded ? null : v.id)}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold">{v.title}</p>
                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[v.status])}>{v.status}</span>
                                                {winner && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                                                        ✓ {winner.label}
                                                    </span>
                                                )}
                                            </div>
                                            {v.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.description}</p>}
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {totalVotes} votos registrados
                                                {quorum !== null && ` · Quórum: ${quorum}%`}
                                                {v.endDate && ` · Prazo: ${new Date(v.endDate + "T00:00").toLocaleDateString("pt-BR")}`}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button onClick={e => { e.stopPropagation(); setEditing(v); setShowModal(true) }}
                                                className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/20 space-y-3">
                                            {v.description && <p className="text-xs text-muted-foreground">{v.description}</p>}
                                            <div className="space-y-2">
                                                {v.options.map(opt => (
                                                    <ResultBar key={opt.id} option={opt} total={totalVotes} />
                                                ))}
                                            </div>
                                            {quorum !== null && (
                                                <p className="text-xs text-muted-foreground text-right">
                                                    Quórum: {totalVotes} de {v.totalUnits} unidades ({quorum}%)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <VotingModal
                    voting={editing}
                    onClose={() => { setShowModal(false); setEditing(null) }}
                    onSave={saveVoting}
                    onDelete={deleteVoting}
                />
            )}
        </div>
    )
}
