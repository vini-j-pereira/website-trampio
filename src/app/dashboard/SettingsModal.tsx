"use client"

import { useState, useRef } from "react"
import { X, Camera, MapPin, Sliders, User, Phone, Mail, FileText, Tag, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
    name: string
    email: string
    phone: string
    bio: string
    city: string
    neighborhood: string
    radiusKm: number
    avatar: string | null // base64 or URL
    categories: string[]
    services: string
    availability: "disponivel" | "ocupado" | "ferias"
}

export const defaultProfile: UserProfile = {
    name: "João Silva",
    email: "joao@trampio.com",
    phone: "",
    bio: "",
    city: "",
    neighborhood: "",
    radiusKm: 15,
    avatar: null,
    categories: [],
    availability: "disponivel",
    services: "",
}

const ALL_CATEGORIES = ["Casa", "Eventos", "Saúde", "Estilo", "Pro"]

const AVAILABILITY_OPTIONS = [
    { value: "disponivel", label: "Disponível", color: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200" },
    { value: "ocupado", label: "Ocupado", color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
    { value: "ferias", label: "De férias", color: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
] as const

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    profile: UserProfile
    onSave: (p: UserProfile) => void
    onClose: () => void
}

export function SettingsModal({ profile, onSave, onClose }: Props) {
    const [draft, setDraft] = useState<UserProfile>({ ...profile })
    const [activeTab, setActiveTab] = useState<"perfil" | "atuacao" | "disponibilidade">("perfil")
    const [saved, setSaved] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
        setDraft(p => ({ ...p, [key]: value }))
    }

    function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => set("avatar", reader.result as string)
        reader.readAsDataURL(file)
    }

    function toggleCategory(cat: string) {
        set("categories", draft.categories.includes(cat)
            ? draft.categories.filter(c => c !== cat)
            : [...draft.categories, cat])
    }

    function handleSave() {
        onSave(draft)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const tabs = [
        { id: "perfil" as const, label: "Perfil", icon: User },
        { id: "atuacao" as const, label: "Atuação", icon: MapPin },
        { id: "disponibilidade" as const, label: "Status", icon: Sliders },
    ]

    const avail = AVAILABILITY_OPTIONS.find(o => o.value === draft.availability)!

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <h2 className="text-base font-bold">Configurações do Perfil</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border shrink-0 px-6">
                    {tabs.map(t => {
                        const Icon = t.icon
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition -mb-px",
                                    activeTab === t.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {t.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-6">

                    {/* ── Perfil tab ──────────────────────────────────────────── */}
                    {activeTab === "perfil" && (
                        <div className="space-y-5">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative">
                                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
                                        {draft.avatar
                                            ? <img src={draft.avatar} alt="avatar" className="h-full w-full object-cover" />
                                            : <span className="text-white text-2xl font-bold">{draft.name.charAt(0)}</span>
                                        }
                                    </div>
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="absolute bottom-0 right-0 h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition"
                                    >
                                        <Camera className="h-3.5 w-3.5 text-white" />
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                                </div>
                                <p className="text-xs text-muted-foreground">Clique na câmera para alterar a foto</p>
                            </div>

                            {/* Fields */}
                            <Field label="Nome completo" icon={User}>
                                <input value={draft.name} onChange={e => set("name", e.target.value)}
                                    className={inputCls} placeholder="Seu nome" />
                            </Field>

                            <Field label="E-mail" icon={Mail}>
                                <input type="email" value={draft.email} onChange={e => set("email", e.target.value)}
                                    className={inputCls} placeholder="seu@email.com" />
                            </Field>

                            <Field label="Telefone / WhatsApp" icon={Phone}>
                                <input value={draft.phone} onChange={e => set("phone", e.target.value)}
                                    className={inputCls} placeholder="(00) 00000-0000" />
                            </Field>

                            <Field label="Bio / Apresentação" icon={FileText}>
                                <textarea value={draft.bio} onChange={e => set("bio", e.target.value)}
                                    className={cn(inputCls, "resize-none")} rows={3}
                                    placeholder="Fale um pouco sobre você e seus serviços..." />
                            </Field>

                            <Field label="Categorias de atuação" icon={Tag}>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {ALL_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                                                draft.categories.includes(cat)
                                                    ? "bg-primary text-white border-primary"
                                                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            <Field label="Serviços principais" icon={Tag}>
                                <textarea value={draft.services} onChange={e => set("services", e.target.value)}
                                    className={cn(inputCls, "resize-none")} rows={2}
                                    placeholder="Ex: Instalação elétrica, Pintura, Jardinagem..." />
                            </Field>
                        </div>
                    )}

                    {/* ── Atuação tab ─────────────────────────────────────────── */}
                    {activeTab === "atuacao" && (
                        <div className="space-y-5">
                            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground">
                                    Defina sua cidade base e o raio de deslocamento. Clientes dentro dessa área poderão encontrar você nas buscas.
                                </p>
                            </div>

                            <Field label="Cidade" icon={MapPin}>
                                <input value={draft.city} onChange={e => set("city", e.target.value)}
                                    className={inputCls} placeholder="Ex: São Paulo" />
                            </Field>

                            <Field label="Bairro / Região" icon={MapPin}>
                                <input value={draft.neighborhood} onChange={e => set("neighborhood", e.target.value)}
                                    className={inputCls} placeholder="Ex: Pinheiros" />
                            </Field>

                            {/* Radius slider */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Sliders className="h-3.5 w-3.5 text-primary" />
                                        Raio de atuação
                                    </label>
                                    <span className="text-sm font-bold text-primary">{draft.radiusKm} km</span>
                                </div>

                                <input
                                    type="range"
                                    min={1} max={100} step={1}
                                    value={draft.radiusKm}
                                    onChange={e => set("radiusKm", Number(e.target.value))}
                                    className="w-full accent-primary cursor-pointer"
                                />

                                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                    <span>1 km</span>
                                    <span>50 km</span>
                                    <span>100 km</span>
                                </div>

                                {/* Visual hint */}
                                <div className="mt-4 rounded-xl bg-muted/40 border border-border p-4 flex items-center gap-4">
                                    <div className="relative shrink-0">
                                        <div className="h-12 w-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                                            <div className="h-8 w-8 rounded-full border-2 border-primary/40 flex items-center justify-center">
                                                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold">Alcance atual</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Você aparecerá em buscas de até{" "}
                                            <strong className="text-primary">{draft.radiusKm} km</strong>{" "}
                                            {draft.city ? `de ${draft.city}` : "da sua localização"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Disponibilidade tab ──────────────────────────────────── */}
                    {activeTab === "disponibilidade" && (
                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground">
                                Seu status fica visível para os clientes na plataforma. Mude quando necessário.
                            </p>

                            {AVAILABILITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => set("availability", opt.value)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition",
                                        draft.availability === opt.value ? opt.bg : "border-border hover:border-muted-foreground/30"
                                    )}
                                >
                                    <div className={cn("h-3 w-3 rounded-full shrink-0", opt.color)} />
                                    <div>
                                        <p className={cn("text-sm font-semibold", draft.availability === opt.value ? opt.text : "text-foreground")}>
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {opt.value === "disponivel" && "Apareço nas buscas e aceito novos serviços"}
                                            {opt.value === "ocupado" && "Apareço nas buscas mas não aceito novos trabalhos agora"}
                                            {opt.value === "ferias" && "Não apareço nas buscas temporariamente"}
                                        </p>
                                    </div>
                                    {draft.availability === opt.value && (
                                        <div className={cn("ml-auto h-5 w-5 rounded-full flex items-center justify-center", opt.color)}>
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {/* Current status preview */}
                            <div className="mt-2 p-3 rounded-xl bg-muted/40 border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Preview do seu status público:</p>
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2 w-2 rounded-full", avail.color)} />
                                    <span className={cn("text-xs font-medium", avail.text)}>{avail.label}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition",
                            saved
                                ? "bg-green-500 text-white"
                                : "bg-primary text-white hover:bg-primary/90"
                        )}
                    >
                        {saved ? <><Check className="h-4 w-4" /> Salvo!</> : "Salvar alterações"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
            </label>
            {children}
        </div>
    )
}
