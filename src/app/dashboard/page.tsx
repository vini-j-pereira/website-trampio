"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Star, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Trash2, Plus, X, Search, FileText, Pencil, Check, Target, Flame, Settings, MapPin, Bell, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReportModal, formatDate } from "./ReportModal"
import { SettingsModal, defaultProfile } from "./SettingsModal"
import type { CalendarEvent, Transaction, TransactionType } from "./ReportModal"
import type { UserProfile } from "./SettingsModal"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekBounds(d: Date) {
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  if (data.every(v => v === 0)) {
    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Adicione entradas para ver o gráfico</p>
      </div>
    )
  }
  const w = 400; const h = 100; const pad = 8
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
  const pts = data.map((v, i): [number, number] => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    h - pad - ((v - min) / range) * (h - pad * 2),
  ])
  const path = `M ${pts.map(p => p.join(",")).join(" L ")}`
  const area = `M ${pts[0].join(",")} L ${pts.map(p => p.join(",")).join(" L ")} L ${w - pad},${h} L ${pad},${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={path} stroke="#FF6B2C" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="white" stroke="#FF6B2C" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

// ─── Small components ─────────────────────────────────────────────────────────

function TrendBadge({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
      positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {value}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Concluído": "bg-green-100 text-green-700",
    "Em andamento": "bg-orange-100 text-orange-700",
    "Agendado": "bg-blue-100 text-blue-700",
  }
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-0.5",
      map[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </span>
  )
}

const TX_COLORS = {
  entrada: { dot: "bg-green-500", value: "text-green-600", bg: "bg-green-50 border-green-100", active: "bg-green-500", inactive: "text-green-700 bg-green-100" },
  saida: { dot: "bg-red-500", value: "text-red-600", bg: "bg-red-50 border-red-100", active: "bg-red-500", inactive: "text-red-700 bg-red-100" },
  "a-receber": { dot: "bg-amber-400", value: "text-amber-600", bg: "bg-amber-50 border-amber-100", active: "bg-amber-400", inactive: "text-amber-700 bg-amber-100" },
} as const

const TX_LABELS: Record<TransactionType, string> = { entrada: "Entrada", saida: "Saída", "a-receber": "A receber" }
const TX_TYPES: TransactionType[] = ["entrada", "saida", "a-receber"]
const CATEGORIES = ["Serviço", "Material", "Estoque", "Aluguel de equipamento", "Transporte", "Outros"]

function TxTypeToggle({ value, onChange }: { value: TransactionType; onChange: (t: TransactionType) => void }) {
  return (
    <div className="flex gap-1">
      {TX_TYPES.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={cn("flex-1 py-1.5 rounded-lg text-xs font-semibold transition",
            value === t ? TX_COLORS[t].active + " text-white" : TX_COLORS[t].inactive)}>
          {TX_LABELS[t]}
        </button>
      ))}
    </div>
  )
}

// ─── Goal Card ───────────────────────────────────────────────────────────────

function GoalCard({
  label, goal, earned, onSetGoal,
}: {
  label: string
  goal: number | null
  earned: number
  onSetGoal: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(String(goal ?? ""))

  const pct = goal && goal > 0 ? Math.min((earned / goal) * 100, 100) : 0
  const reached = goal !== null && earned >= goal
  const diff = goal !== null ? goal - earned : null

  function commit() {
    const v = Number(input)
    if (v > 0) onSetGoal(v)
    setEditing(false)
  }

  function motivational() {
    if (!goal) return "Defina sua meta abaixo"
    if (pct === 0) return "Bora começar! 💪"
    if (pct < 25) return "Ótimo começo! 🔥"
    if (pct < 50) return "No caminho certo! 🚀"
    if (pct < 75) return "Mais da metade! ⚡"
    if (pct < 100) return "Quase lá! 🎯"
    return "Meta atingida! 🎉"
  }

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm px-4 py-3 flex flex-col gap-2 min-w-[160px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {reached
            ? <Flame className="h-3.5 w-3.5 text-orange-500" />
            : <Target className="h-3.5 w-3.5 text-primary" />}
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <button onClick={() => { setInput(String(goal ?? "")); setEditing(v => !v) }}
          className="p-1 rounded-md hover:bg-muted transition">
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {editing ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground shrink-0">R$</span>
          <input
            autoFocus
            type="number"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") commit() }}
            className="flex-1 w-0 border border-primary/40 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ex: 3000"
          />
          <button onClick={commit} className="p-1 rounded-md bg-primary text-white hover:bg-primary/90 transition">
            <Check className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-end justify-between mb-1">
            <span className={cn("text-lg font-bold leading-none", reached ? "text-orange-500" : "text-foreground")}>
              R$ {earned.toLocaleString("pt-BR")}
            </span>
            <span className="text-xs text-muted-foreground">
              {goal ? `/ R$ ${goal.toLocaleString("pt-BR")}` : "sem meta"}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", reached ? "bg-orange-500" : "bg-primary")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {goal !== null && !reached && diff !== null
              ? `Faltam R$ ${diff.toLocaleString("pt-BR")} · `
              : ""}{motivational()}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
  const [serviceFilter, setServiceFilter] = useState<"Semana" | "Mês">("Semana")
  const [showReport, setShowReport] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [weekGoal, setWeekGoal] = useState<number | null>(null)
  const [monthGoal, setMonthGoal] = useState<number | null>(null)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTx, setNewTx] = useState<Omit<Transaction, "id">>({ type: "entrada", value: 0, date: "", description: "", category: "Serviço" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTx, setEditTx] = useState<Partial<Transaction>>({})

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function saveEvent(ev: CalendarEvent) {
    setEvents(prev => prev.find(e => e.id === ev.id) ? prev.map(e => e.id === ev.id ? ev : e) : [...prev, ev])

    // ── Auto-sync to financial ─────────────────────────────────────────────
    if ((ev.earnings ?? 0) > 0) {
      const txId = `ev-${ev.id}`
      const mm = String(ev.month + 1).padStart(2, "0")
      const dd = String(ev.day).padStart(2, "0")
      const txDate = `${ev.year}-${mm}-${dd}`
      const txType: TransactionType = ev.status === "Concluído" ? "entrada" : "a-receber"
      const linked: Transaction = {
        id: txId,
        type: txType,
        value: ev.earnings!,
        date: txDate,
        description: `📅 ${ev.title}${ev.client ? ` · ${ev.client}` : ""}`,
        category: "Serviço",
      }
      setTransactions(prev =>
        prev.find(t => t.id === txId)
          ? prev.map(t => t.id === txId ? linked : t)
          : [...prev, linked]
      )
    } else {
      // Remove linked tx if value was cleared
      setTransactions(prev => prev.filter(t => t.id !== `ev-${ev.id}`))
    }

    setSelectedDay(null); setActiveEvent(null)
  }
  function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
    setTransactions(prev => prev.filter(t => t.id !== `ev-${id}`))
    setActiveEvent(null)
  }

  const { start: wStart, end: wEnd } = getWeekBounds(today)
  const displayServices = serviceFilter === "Semana"
    ? events.filter(e => { const d = new Date(e.year, e.month, e.day); return d >= wStart && d <= wEnd })
    : events.filter(e => e.month === month && e.year === year)

  function addTx() {
    if (!newTx.description || !newTx.date || newTx.value <= 0) return
    setTransactions(prev => [...prev, { ...newTx, id: crypto.randomUUID() }])
    setNewTx({ type: "entrada", value: 0, date: "", description: "", category: "Serviço" })
    setShowAddForm(false)
  }
  function deleteTx(id: string) { setTransactions(prev => prev.filter(t => t.id !== id)) }
  function startEdit(tx: Transaction) { setEditingId(tx.id); setEditTx({ ...tx }) }
  function saveEdit() {
    setTransactions(prev => prev.map(t => t.id === editingId ? { ...t, ...editTx } as Transaction : t))
    setEditingId(null)
  }

  const totalEntradas = transactions.filter(t => t.type === "entrada").reduce((s, t) => s + t.value, 0)
  const totalSaidas = transactions.filter(t => t.type === "saida").reduce((s, t) => s + t.value, 0)
  const totalAReceber = transactions.filter(t => t.type === "a-receber").reduce((s, t) => s + t.value, 0)
  const saldo = totalEntradas - totalSaidas

  // ── Goal computations ─────────────────────────────────────────────────────
  // Events with earnings already auto-create linked "entrada" transactions via
  // saveEvent(), so we only read from transactions to avoid double-counting.
  const weekEarned = useMemo(() =>
    transactions
      .filter(t => t.type === "entrada")
      .filter(t => { const d = new Date(t.date); return d >= wStart && d <= wEnd })
      .reduce((s, t) => s + t.value, 0)
    , [transactions, wStart, wEnd])

  const monthEarned = useMemo(() =>
    transactions
      .filter(t => t.type === "entrada")
      .filter(t => { const [y, m] = t.date.split("-").map(Number); return y === today.getFullYear() && m - 1 === today.getMonth() })
      .reduce((s, t) => s + t.value, 0)
    , [transactions])

  const sparklineData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (11 - i))
    const [m, y] = [d.getMonth(), d.getFullYear()]
    // Net balance per month: entradas minus saidas (a-receber excluded — pending)
    return transactions
      .filter(t => t.type !== "a-receber")
      .filter(t => { const [ty, tm] = t.date.split("-").map(Number); return ty === y && tm - 1 === m })
      .reduce((s, t) => s + (t.type === "entrada" ? t.value : -t.value), 0)
  }), [transactions])

  const monthLabels = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (11 - i))
    return d.toLocaleDateString("pt-BR", { month: "short" })
  }), [])

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

  return (
    <div className="p-6 space-y-5 min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Olá, {profile.name.split(" ")[0]} 👋
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-amber-700">4,9</span>
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Bem-vindo de volta ao seu painel</p>
        </div>

        {/* ── Status, raio e % da meta mensal ── */}
        <div className="flex items-stretch gap-3 flex-wrap">

          {/* Raio de atuação */}
          <div className="bg-white border border-border rounded-2xl shadow-sm px-4 py-2.5 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Raio de atuação</p>
              <p className="text-sm font-bold">
                {profile.radiusKm} km{profile.city ? ` · ${profile.city}` : ""}
              </p>
            </div>
          </div>

          {/* Status */}
          {(() => {
            const opts = {
              disponivel: { dot: "bg-green-500", label: "Disponível", bg: "bg-green-50 border-green-200", text: "text-green-700" },
              ocupado: { dot: "bg-orange-500", label: "Ocupado", bg: "bg-orange-50 border-orange-200", text: "text-orange-700" },
              ferias: { dot: "bg-blue-500", label: "De férias", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
            } as const
            const s = opts[profile.availability]
            return (
              <button
                onClick={() => setShowSettings(true)}
                className={cn("flex items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-sm transition hover:opacity-80", s.bg)}
              >
                <div className={cn("h-2 w-2 rounded-full shrink-0 animate-pulse", s.dot)} />
                <span className={cn("text-xs font-semibold", s.text)}>{s.label}</span>
              </button>
            )
          })()}

          {/* % Meta mensal — ring */}
          {(() => {
            const pct = monthGoal && monthGoal > 0 ? Math.min(Math.round((monthEarned / monthGoal) * 100), 100) : null
            const r = 16; const circ = 2 * Math.PI * r
            const reached = pct !== null && pct >= 100
            return (
              <button
                onClick={() => document.getElementById("goal-section")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-white border border-border rounded-2xl shadow-sm px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition"
                title="Ver metas"
              >
                <svg width="40" height="40" className="-rotate-90">
                  <circle cx="20" cy="20" r={r} fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <circle cx="20" cy="20" r={r} fill="none"
                    stroke={reached ? "#f97316" : "#FF6B2C"}
                    strokeWidth="4"
                    strokeDasharray={circ}
                    strokeDashoffset={pct !== null ? circ - (pct / 100) * circ : circ}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  <text x="20" y="-14" textAnchor="middle" className="fill-foreground" fontSize="8" fontWeight="700"
                    style={{ transform: "rotate(90deg)", transformOrigin: "20px 20px" }}>
                    {pct !== null ? `${pct}%` : "meta"}
                  </text>
                </svg>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none">Meta mensal</p>
                  <p className="text-xs font-bold">
                    {pct !== null
                      ? reached ? "🎉 Atingida!" : `${pct}% concluído`
                      : "Definir meta"}
                  </p>
                </div>
              </button>
            )
          })()}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/search" className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-white text-sm font-medium hover:bg-muted transition shadow-sm">
            <Search className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Buscar Serviço</span>
          </Link>
          <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition shadow-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar Relatório</span>
          </button>

          {/* Notifications */}
          <Link
            href="/chat"
            className="relative flex items-center justify-center h-10 w-10 rounded-full border border-border bg-white shadow-sm hover:bg-muted transition"
            title="Chat"
          >
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white" />
          </Link>
          <button
            className="relative flex items-center justify-center h-10 w-10 rounded-full border border-border bg-white shadow-sm hover:bg-muted transition"
            title="Notificações"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
          </button>

          {/* Settings + User chip */}
          <div className="flex items-center gap-2 bg-white border border-border rounded-full px-3 py-2 shadow-sm">
            {profile.avatar
              ? <img src={profile.avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover shrink-0" />
              : <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">{profile.name.charAt(0)}</div>
            }
            <div className="hidden sm:block">
              <p className="text-xs font-semibold leading-none">{profile.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="ml-1 p-1.5 rounded-full hover:bg-muted transition"
              title="Configurações"
            >
              <Settings className="h-4 w-4 text-muted-foreground hover:text-primary transition" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 1: Calendário + Serviços ────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">

        {/* CALENDÁRIO */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Agenda</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-muted transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium capitalize w-44 text-center">
                {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-muted transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
              <div key={d} className="py-1.5 font-semibold text-muted-foreground text-[11px]">{d}</div>
            ))}
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={idx} />
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const hasEvent = events.some(e => e.day === day && e.month === month && e.year === year)
              return (
                <button key={idx} onClick={() => setSelectedDay(day)}
                  className={cn("h-9 w-9 mx-auto rounded-full text-sm transition font-medium flex items-center justify-center",
                    hasEvent ? "bg-primary text-white shadow-sm" : "",
                    isToday && !hasEvent ? "bg-primary/15 text-primary font-bold ring-2 ring-primary/30" : "",
                    !isToday && !hasEvent ? "hover:bg-muted" : "")}>
                  {day}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
            Clique em um dia para adicionar um serviço ou compromisso.
          </p>
        </div>

        {/* SERVIÇOS */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Serviços</span>
            <div className="flex bg-muted rounded-lg p-0.5">
              {(["Semana", "Mês"] as const).map(f => (
                <button key={f} onClick={() => setServiceFilter(f)}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium transition",
                    serviceFilter === f ? "bg-white shadow-sm text-foreground" : "text-muted-foreground")}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
            {displayServices.length === 0
              ? (
                <div className="h-32 flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-muted-foreground">Nenhum serviço neste período.</p>
                  <p className="text-xs text-muted-foreground mt-1">Adicione no calendário ao lado.</p>
                </div>
              ) : (
                <div className="space-y-3 pr-1">
                  {[...displayServices]
                    .sort((a, b) => new Date(a.year, a.month, a.day).getTime() - new Date(b.year, b.month, b.day).getTime())
                    .map(e => (
                      <div key={e.id} onClick={() => setActiveEvent(e)}
                        className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0 cursor-pointer hover:bg-muted/30 -mx-1 px-1 rounded-lg transition">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {e.title.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{e.client || "—"} · {e.day}/{e.month + 1}</p>
                          <StatusBadge status={e.status || "Agendado"} />
                        </div>
                        <p className="text-sm font-bold shrink-0">{e.earnings ? `R$ ${e.earnings.toLocaleString("pt-BR")}` : "—"}</p>
                      </div>
                    ))}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Gráfico + Financeiro ─────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">

        {/* GRÁFICO */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-sm font-semibold">Fluxo de Caixa</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={cn("text-3xl font-bold", saldo >= 0 ? "text-foreground" : "text-red-600")}>
                  {saldo >= 0 ? "" : "-"}{fmt(Math.abs(saldo))}
                </span>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                  saldo >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  {saldo >= 0 ? "Saldo positivo" : "Saldo negativo"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Saldo líquido (entradas − saídas)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Receita bruta</p>
              <p className="text-xl font-bold text-green-600">{fmt(totalEntradas)}</p>
            </div>
          </div>
          <Sparkline data={sparklineData} />
          <div className="flex mt-1">
            {monthLabels.map((l, i) => (
              <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground">{l}</div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-3">
            {([
              { dot: "bg-green-500", label: "Entradas", v: totalEntradas, cl: "text-green-600" },
              { dot: "bg-red-500", label: "Saídas", v: totalSaidas, cl: "text-red-600" },
              { dot: "bg-amber-400", label: "A receber", v: totalAReceber, cl: "text-amber-600" },
            ] as const).map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", item.dot)} />
                <div>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className={cn("text-sm font-bold", item.cl)}>{fmt(item.v)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTROLE FINANCEIRO */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Financeiro</span>
            <button onClick={() => { setShowAddForm(v => !v); setEditingId(null) }}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition">
              {showAddForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {showAddForm ? "Cancelar" : "Adicionar"}
            </button>
          </div>

          {/* ADD FORM */}
          {showAddForm && (
            <div className="p-3 bg-muted/40 rounded-xl space-y-2 border border-border">
              <TxTypeToggle value={newTx.type} onChange={t => setNewTx(p => ({ ...p, type: t, category: "Serviço" }))} />
              {newTx.type === "saida" && (
                <select value={newTx.category} onChange={e => setNewTx(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              )}
              <input type="number" placeholder="Valor (R$)" value={newTx.value || ""}
                onChange={e => setNewTx(p => ({ ...p, value: Number(e.target.value) }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="date" value={newTx.date} onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input placeholder="Descrição" value={newTx.description} onChange={e => setNewTx(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={addTx} className="w-full py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition">
                Salvar
              </button>
            </div>
          )}

          {/* LIST */}
          <div className="overflow-y-auto space-y-2 pr-0.5" style={{ maxHeight: showAddForm ? 160 : 290 }}>
            {transactions.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-xs text-muted-foreground">Nenhum lançamento ainda.</p>
                <p className="text-xs text-muted-foreground">Clique em "Adicionar" para começar.</p>
              </div>
            )}
            {[...transactions].reverse().map(tx => {
              const c = TX_COLORS[tx.type]

              if (editingId === tx.id) {
                return (
                  <div key={tx.id} className="rounded-xl border border-primary/30 p-2.5 space-y-1.5 bg-white">
                    <TxTypeToggle value={(editTx.type ?? tx.type) as TransactionType} onChange={t => setEditTx(p => ({ ...p, type: t }))} />
                    {(editTx.type ?? tx.type) === "saida" && (
                      <select value={editTx.category ?? tx.category} onChange={e => setEditTx(p => ({ ...p, category: e.target.value }))}
                        className="w-full border border-border rounded px-2 py-1 text-[10px] bg-white focus:outline-none">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    )}
                    <input type="number" value={editTx.value ?? tx.value} onChange={e => setEditTx(p => ({ ...p, value: Number(e.target.value) }))}
                      className="w-full border border-border rounded px-2 py-1 text-[10px] focus:outline-none" placeholder="Valor" />
                    <input type="date" value={editTx.date ?? tx.date} onChange={e => setEditTx(p => ({ ...p, date: e.target.value }))}
                      className="w-full border border-border rounded px-2 py-1 text-[10px] focus:outline-none" />
                    <input value={editTx.description ?? tx.description} onChange={e => setEditTx(p => ({ ...p, description: e.target.value }))}
                      className="w-full border border-border rounded px-2 py-1 text-[10px] focus:outline-none" placeholder="Descrição" />
                    <div className="flex gap-1">
                      <button onClick={() => setEditingId(null)} className="flex-1 py-1 rounded border border-border text-[10px] hover:bg-muted transition">Cancelar</button>
                      <button onClick={saveEdit} className="flex-1 py-1 rounded bg-primary text-white text-[10px] font-semibold flex items-center justify-center gap-1">
                        <Check className="h-3 w-3" /> Salvar
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={tx.id} className={cn("flex items-center gap-2 rounded-xl px-3 py-2 border", c.bg)}>
                  <div className={cn("h-2 w-2 rounded-full shrink-0", c.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(tx.date)}{tx.category && tx.category !== "Serviço" ? ` · ${tx.category}` : ""}
                    </p>
                  </div>
                  <p className={cn("text-xs font-bold shrink-0", c.value)}>
                    {tx.type === "saida" ? "-" : "+"}R$ {tx.value.toLocaleString("pt-BR")}
                  </p>
                  <button onClick={() => startEdit(tx)} className="text-muted-foreground hover:text-primary transition shrink-0">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => deleteTx(tx.id)} className="text-muted-foreground hover:text-red-500 transition shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Metas ───────────────────────────────────────────── */}
      <div id="goal-section" className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <GoalCard label="Meta Semanal" goal={weekGoal} earned={weekEarned} onSetGoal={setWeekGoal} />
        <GoalCard label="Meta Mensal" goal={monthGoal} earned={monthEarned} onSetGoal={setMonthGoal} />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {(selectedDay !== null || activeEvent) && (
        <EventModal
          day={activeEvent?.day ?? selectedDay!}
          month={activeEvent?.month ?? month}
          year={activeEvent?.year ?? year}
          event={activeEvent}
          onClose={() => { setSelectedDay(null); setActiveEvent(null) }}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
      {showReport && (
        <ReportModal
          events={events}
          transactions={transactions}
          month={month}
          year={year}
          onClose={() => setShowReport(false)}
        />
      )}
      {showSettings && (
        <SettingsModal
          profile={profile}
          onSave={p => { setProfile(p); setShowSettings(false) }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

// ─── Event Modal ──────────────────────────────────────────────────────────────

function EventModal({ day, month, year, event, onClose, onSave, onDelete }: {
  day: number; month: number; year: number
  event: CalendarEvent | null
  onClose: () => void
  onSave: (e: CalendarEvent) => void
  onDelete: (id: string) => void
}) {
  const [title, setTitle] = useState(event?.title || "")
  const [client, setClient] = useState(event?.client || "")
  const [description, setDesc] = useState(event?.description || "")
  const [time, setTime] = useState(event?.time || "")
  const [reminder, setReminder] = useState(event?.reminder || "")
  const [isReminder, setIsReminder] = useState(event?.isReminder || false)
  const [earnings, setEarnings] = useState(event?.earnings || 0)
  const [status, setStatus] = useState<CalendarEvent["status"]>(event?.status || "Agendado")

  function handleSave() {
    if (!title || !time) return
    onSave({ id: event?.id || crypto.randomUUID(), title, client, description, day, month, year, time, reminder, isReminder, earnings, status })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
          <h2 className="font-semibold text-white text-lg">
            {event ? "Editar Serviço" : `Novo Serviço — ${day}/${month + 1}/${year}`}
          </h2>
        </div>
        <div className="p-6 space-y-3 max-h-[80vh] overflow-y-auto">
          <input className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Título do serviço *" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Nome do cliente" value={client} onChange={e => setClient(e.target.value)} />
          <input type="number" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Valor do serviço (R$)" value={earnings || ""} onChange={e => setEarnings(Number(e.target.value))} />
          <div className="flex gap-1">
            {(["Agendado", "Em andamento", "Concluído"] as const).map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={cn("flex-1 py-1.5 rounded-lg text-xs font-medium border transition",
                  status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
                {s}
              </button>
            ))}
          </div>
          <textarea className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            placeholder="Observações" rows={2} value={description} onChange={e => setDesc(e.target.value)} />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-muted-foreground mb-1">Horário *</label>
              <input type="time" className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted-foreground mb-1">Lembrete</label>
              <input type="time" className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={reminder} onChange={e => setReminder(e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={isReminder} onChange={e => setIsReminder(e.target.checked)} className="accent-primary" />
            <span className="text-sm text-muted-foreground">Apenas lembrete</span>
          </label>
          <div className="flex justify-between items-center pt-2">
            {event && (
              <button onClick={() => onDelete(event.id)} className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-700 transition">
                <Trash2 size={14} /> Excluir
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}