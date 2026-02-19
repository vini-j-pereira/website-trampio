"use client"

import { X, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalendarEvent {
    id: string
    title: string
    client: string
    description: string
    day: number
    month: number
    year: number
    time: string
    reminder: string
    isReminder: boolean
    earnings: number
    status: "Agendado" | "Em andamento" | "Concluído"
}

export type TransactionType = "entrada" | "saida" | "a-receber"

export interface Transaction {
    id: string
    type: TransactionType
    value: number
    date: string // YYYY-MM-DD
    description: string
    category: string
}

export function formatDate(iso: string) {
    if (!iso) return ""
    const [y, m, d] = iso.split("-")
    return `${d}/${m}/${y}`
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        "Concluído": "bg-green-100 text-green-700",
        "Em andamento": "bg-orange-100 text-orange-700",
        "Agendado": "bg-blue-100 text-blue-700",
    }
    return (
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", map[status] ?? "bg-muted text-muted-foreground")}>
            {status}
        </span>
    )
}

interface Props {
    events: CalendarEvent[]
    transactions: Transaction[]
    month: number
    year: number
    onClose: () => void
}

export function ReportModal({ events, transactions, month, year, onClose }: Props) {
    const monthName = new Date(year, month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    const monthEvents = events.filter(e => e.month === month && e.year === year)
    const monthTx = transactions.filter(t => {
        const [y, m] = t.date.split("-").map(Number)
        return y === year && m - 1 === month
    })

    const totalServicos = monthEvents.reduce((s, e) => s + (e.earnings || 0), 0)
    const entradas = monthTx.filter(t => t.type === "entrada")
    const saidas = monthTx.filter(t => t.type === "saida")
    const aReceber = monthTx.filter(t => t.type === "a-receber")
    const totalEntradas = entradas.reduce((s, t) => s + t.value, 0)
    const totalSaidas = saidas.reduce((s, t) => s + t.value, 0)
    const totalAReceber = aReceber.reduce((s, t) => s + t.value, 0)
    const saldo = totalEntradas - totalSaidas

    const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-lg font-bold capitalize">Relatório — {monthName}</h2>
                        <p className="text-xs text-muted-foreground">Gerado em {new Date().toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-muted transition">
                            <Printer className="h-3.5 w-3.5" /> Imprimir
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 space-y-5">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Receita Serviços", value: totalServicos, cls: "text-green-600 bg-green-50" },
                            { label: "Entradas", value: totalEntradas, cls: "text-green-600 bg-green-50" },
                            { label: "Saídas", value: totalSaidas, cls: "text-red-600 bg-red-50" },
                            { label: "A Receber", value: totalAReceber, cls: "text-amber-600 bg-amber-50" },
                        ].map(item => (
                            <div key={item.label} className={cn("rounded-xl p-3", item.cls.split(" ")[1])}>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className={cn("text-base font-bold", item.cls.split(" ")[0])}>{fmt(item.value)}</p>
                            </div>
                        ))}
                    </div>

                    <div className={cn("rounded-xl p-4 flex items-center justify-between", saldo >= 0 ? "bg-green-50" : "bg-red-50")}>
                        <span className="font-semibold text-sm">Saldo do mês</span>
                        <span className={cn("text-xl font-bold", saldo >= 0 ? "text-green-600" : "text-red-600")}>
                            {saldo >= 0 ? "+" : ""}{fmt(saldo)}
                        </span>
                    </div>

                    {/* Serviços */}
                    <Section title={`Serviços Prestados (${monthEvents.length})`}>
                        {monthEvents.length === 0
                            ? <Empty text="Nenhum serviço neste mês." />
                            : <Table
                                headers={["Serviço", "Cliente", "Data", "Status", "Valor"]}
                                rows={monthEvents.map(e => [
                                    e.title,
                                    e.client || "—",
                                    `${e.day}/${e.month + 1}/${e.year}`,
                                    <StatusBadge key={e.id} status={e.status || "Agendado"} />,
                                    <span key={e.id} className="text-green-600 font-semibold">{e.earnings ? fmt(e.earnings) : "—"}</span>,
                                ])}
                                footer={["Total", "", "", "", <span key="t" className="text-green-600 font-bold">{fmt(totalServicos)}</span>]}
                                footerBg="bg-green-50"
                            />
                        }
                    </Section>

                    {/* Entradas */}
                    {entradas.length > 0 && (
                        <Section title="Entradas">
                            <Table
                                headers={["Descrição", "Data", "Valor"]}
                                rows={entradas.map(t => [t.description, formatDate(t.date), <span key={t.id} className="text-green-600 font-semibold">+{fmt(t.value)}</span>])}
                            />
                        </Section>
                    )}

                    {/* Saídas */}
                    {saidas.length > 0 && (
                        <Section title="Saídas e Custos">
                            <Table
                                headers={["Descrição", "Categoria", "Data", "Valor"]}
                                rows={saidas.map(t => [t.description, t.category, formatDate(t.date), <span key={t.id} className="text-red-600 font-semibold">-{fmt(t.value)}</span>])}
                                footer={["Total", "", "", <span key="t" className="text-red-600 font-bold">-{fmt(totalSaidas)}</span>]}
                                footerBg="bg-red-50"
                            />
                        </Section>
                    )}

                    {/* A Receber */}
                    {aReceber.length > 0 && (
                        <Section title="A Receber">
                            <Table
                                headers={["Descrição", "Data Prevista", "Valor"]}
                                rows={aReceber.map(t => [t.description, formatDate(t.date), <span key={t.id} className="text-amber-600 font-semibold">{fmt(t.value)}</span>])}
                            />
                        </Section>
                    )}
                </div>
            </div>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="font-semibold text-sm mb-2">{title}</h3>
            {children}
        </div>
    )
}

function Empty({ text }: { text: string }) {
    return <p className="text-xs text-muted-foreground">{text}</p>
}

function Table({ headers, rows, footer, footerBg }: {
    headers: string[]
    rows: (string | React.ReactNode)[][]
    footer?: (string | React.ReactNode)[]
    footerBg?: string
}) {
    return (
        <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
                <thead className="bg-muted/50">
                    <tr>{headers.map(h => <th key={h} className="text-left px-4 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => <td key={j} className="px-4 py-2">{cell}</td>)}
                        </tr>
                    ))}
                    {footer && (
                        <tr className={cn("font-semibold", footerBg)}>
                            {footer.map((cell, j) => <td key={j} className="px-4 py-2">{cell}</td>)}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
