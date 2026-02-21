"use client"

import { useState } from "react"
import { useLocalStorage } from "./useLocalStorage"
import { Plus, X, Download, FolderOpen, FileText, Pencil, Trash2, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type DocCategory = "Contratos" | "Regulamento Interno" | "Financeiro" | "Atas Antigas" | "Outros"

export interface CondoDocument {
    id: string
    name: string
    category: DocCategory
    addedAt: string
    url: string
    notes: string
}

const CAT_COLORS: Record<DocCategory, string> = {
    "Contratos": "bg-blue-100 text-blue-700",
    "Regulamento Interno": "bg-purple-100 text-purple-700",
    "Financeiro": "bg-green-100 text-green-700",
    "Atas Antigas": "bg-amber-100 text-amber-700",
    "Outros": "bg-gray-100 text-gray-600",
}

const CAT_ICONS: Record<DocCategory, React.ReactNode> = {
    "Contratos": <FileText className="h-4 w-4" />,
    "Regulamento Interno": <FileText className="h-4 w-4" />,
    "Financeiro": <FileText className="h-4 w-4" />,
    "Atas Antigas": <FileText className="h-4 w-4" />,
    "Outros": <FileText className="h-4 w-4" />,
}

const CATEGORIES: DocCategory[] = ["Contratos", "Regulamento Interno", "Financeiro", "Atas Antigas", "Outros"]

function DocModal({
    doc,
    onClose,
    onSave,
    onDelete,
}: {
    doc: CondoDocument | null
    onClose: () => void
    onSave: (d: CondoDocument) => void
    onDelete?: (id: string) => void
}) {
    const blank: Omit<CondoDocument, "id"> = {
        name: "", category: "Contratos", addedAt: new Date().toISOString().slice(0, 10), url: "", notes: "",
    }
    const [form, setForm] = useState<Omit<CondoDocument, "id">>(doc ? { ...doc } : blank)

    function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
        setForm(p => ({ ...p, [k]: v }))
    }

    function handleSave() {
        if (!form.name) return
        onSave({ ...form, id: doc?.id || crypto.randomUUID() })
    }

    const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">{doc ? "Editar Documento" : "Adicionar Documento"}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-3">
                    <input className={inputCls} placeholder="Nome do documento *" value={form.name} onChange={e => set("name", e.target.value)} />

                    <div className="relative">
                        <select value={form.category} onChange={e => set("category", e.target.value as DocCategory)}
                            className="w-full appearance-none border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white pr-9">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">Data de adição</label>
                        <input type="date" className={inputCls} value={form.addedAt} onChange={e => set("addedAt", e.target.value)} />
                    </div>

                    <input className={inputCls} placeholder="Link / URL do documento (opcional)" value={form.url} onChange={e => set("url", e.target.value)} />
                    <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Observações" value={form.notes} onChange={e => set("notes", e.target.value)} />
                </div>
                <div className="px-6 pb-6 flex justify-between items-center">
                    {doc && onDelete && (
                        <button onClick={() => onDelete(doc.id)} className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-700 transition">
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

export function DocumentsTab() {
    const [docs, setDocs] = useLocalStorage<CondoDocument[]>("trampio:documents", [])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<CondoDocument | null>(null)
    const [catFilter, setCatFilter] = useState<DocCategory | "Todas">("Todas")

    function saveDoc(d: CondoDocument) {
        setDocs(prev => prev.find(x => x.id === d.id) ? prev.map(x => x.id === d.id ? d : x) : [...prev, d])
        setShowModal(false); setEditing(null)
    }

    function deleteDoc(id: string) {
        setDocs(prev => prev.filter(x => x.id !== id))
        setShowModal(false); setEditing(null)
    }

    const filtered = docs
        .filter(d => catFilter === "Todas" || d.category === catFilter)
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt))

    return (
        <div className="space-y-4">
            {/* Category summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {CATEGORIES.map(cat => (
                    <button key={cat}
                        onClick={() => setCatFilter(catFilter === cat ? "Todas" : cat)}
                        className={cn(
                            "bg-white border rounded-2xl shadow-sm px-3 py-3 text-left transition hover:shadow-md",
                            catFilter === cat ? "border-primary ring-2 ring-primary/20" : "border-border"
                        )}>
                        <p className="text-[10px] text-muted-foreground">{cat}</p>
                        <p className="text-xl font-bold mt-0.5">{docs.filter(d => d.category === cat).length}</p>
                    </button>
                ))}
            </div>

            <div className="bg-white border border-border rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Documentos</span>
                        {catFilter !== "Todas" && (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", CAT_COLORS[catFilter])}>{catFilter}</span>
                        )}
                    </div>
                    <button onClick={() => { setEditing(null); setShowModal(true) }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition shadow-sm">
                        <Plus className="h-4 w-4" /> Adicionar
                    </button>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <FolderOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Nenhum documento encontrado.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(d => (
                            <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition">
                                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", CAT_COLORS[d.category])}>
                                    {CAT_ICONS[d.category]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{d.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(d.addedAt + "T00:00").toLocaleDateString("pt-BR")}
                                        {d.notes && ` · ${d.notes}`}
                                    </p>
                                </div>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium hidden sm:inline-block", CAT_COLORS[d.category])}>
                                    {d.category}
                                </span>
                                <div className="flex gap-1 shrink-0">
                                    {d.url && (
                                        <a href={d.url} target="_blank" rel="noreferrer"
                                            className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary"
                                            title="Abrir documento">
                                            <Download className="h-4 w-4" />
                                        </a>
                                    )}
                                    <button onClick={() => { setEditing(d); setShowModal(true) }}
                                        className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <DocModal
                    doc={editing}
                    onClose={() => { setShowModal(false); setEditing(null) }}
                    onSave={saveDoc}
                    onDelete={deleteDoc}
                />
            )}
        </div>
    )
}
