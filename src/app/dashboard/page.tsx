"use client"

import { useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  Star,
  Users,
  Clock,
  Calendar,
  MessageCircle,
  Search,
  User,
  Settings,
  Briefcase,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EventType {
  id: string
  title: string
  description: string
  day: number
  month: number
  year: number
  time: string
  reminder: string
  isReminder: boolean
}

export default function DashboardPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [events, setEvents] = useState<EventType[]>([])
  const [activeEvent, setActiveEvent] = useState<EventType | null>(null)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Array do calendário com espaços vazios antes do 1º dia
  const calendarDays: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function saveEvent(event: EventType) {
    setEvents(prev => {
      const exists = prev.find(e => e.id === event.id)
      if (exists) return prev.map(e => e.id === event.id ? event : e)
      return [...prev, event]
    })
    setSelectedDay(null)
    setActiveEvent(null)
  }

  function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
    setActiveEvent(null)
  }

  const upcomingEvents = events
    .filter(e => e.year >= today.getFullYear() && e.month >= today.getMonth())
    .sort((a, b) => new Date(a.year, a.month, a.day).getTime() - new Date(b.year, b.month, b.day).getTime())

  return (
    <div className="p-8 space-y-8">

      {/* QUICK NAV - Agora escondido no mobile com hidden md:block */}
      <div className="bg-white border border-border rounded-2xl p-3 shadow-sm hidden md:block">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { icon: User, label: "Perfil", href: "/profile" },
            { icon: MessageCircle, label: "Chat", href: "/chat" },
            { icon: Search, label: "Buscar Serviços", href: "/search" },
            { icon: Calendar, label: "Agenda", href: "/agenda" },
            { icon: Briefcase, label: "Orçamentos", href: "/quotes" },
            { icon: Settings, label: "Configurações", href: "/settings" },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Link
                key={i}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-primary/10 transition whitespace-nowrap"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, João Silva
        </p>
      </div>

      {/* METRICS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Receita Total", value: "R$ 12.450", icon: DollarSign },
          { title: "Trabalhos Ativos", value: "3", icon: Briefcase },
          { title: "Avaliação Média", value: "4.9", icon: Star },
          { title: "Visitas no Perfil", value: "1.234", icon: Users },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{item.title}</span>
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* CALENDÁRIO FUNCIONAL */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>
              <ChevronLeft />
            </button>
            <div className="font-medium text-lg">
              {currentMonth.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(d => (
              <div key={d} className="font-medium text-muted-foreground py-2">{d}</div>
            ))}

            {calendarDays.map((day, idx) => {
              if (!day) return <div key={idx}></div>

              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const hasEvent = events.some(e => e.day === day && e.month === month && e.year === year)

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "h-10 rounded-lg transition",
                    isToday ? "bg-orange-200" : "",
                    hasEvent ? "bg-orange-500 text-white" : "hover:bg-primary/10"
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* PRÓXIMOS SERVIÇOS DINÂMICO */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Próximos Serviços</h3>

          <div className="space-y-4">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum compromisso registrado.</p>
            )}

            {upcomingEvents.map(event => (
              <div
                key={event.id}
                onClick={() => setActiveEvent(event)}
                className="cursor-pointer border-b pb-3 last:border-0"
              >
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  Dia {event.day}/{event.month + 1}/{event.year} às {event.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {(selectedDay || activeEvent) && (
        <EventModal
          day={activeEvent?.day || selectedDay}
          month={activeEvent?.month ?? month}
          year={activeEvent?.year ?? year}
          event={activeEvent}
          onClose={() => { setSelectedDay(null); setActiveEvent(null) }}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  )
}

function EventModal({ day, month, year, event, onClose, onSave, onDelete }: any) {
  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")
  const [time, setTime] = useState(event?.time || "")
  const [reminder, setReminder] = useState(event?.reminder || "")
  const [isReminder, setIsReminder] = useState(event?.isReminder || false)

  function handleSave() {
    if (!title || !time) return

    onSave({
      id: event?.id || crypto.randomUUID(),
      title,
      description,
      day,
      month,
      year,
      time,
      reminder,
      isReminder,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl space-y-4">
        <h2 className="font-semibold text-lg">
          {event ? "Editar Compromisso" : `Novo compromisso - ${day}/${month + 1}/${year}`}
        </h2>

        <input
          className="w-full border p-2 rounded-md"
          placeholder="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded-md"
          placeholder="Descrição"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">Horário do compromisso</label>
            <input
              type="time"
              className="w-full border p-2 rounded-md"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">Horário do lembrete</label>
            <input
              type="time"
              className="w-full border p-2 rounded-md"
              value={reminder}
              onChange={e => setReminder(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isReminder}
            onChange={e => setIsReminder(e.target.checked)}
            id="isReminder"
          />
          <label htmlFor="isReminder" className="text-sm">Apenas lembrete</label>
        </div>

        <div className="flex justify-between pt-4">
          {event && (
            <button
              onClick={() => onDelete(event.id)}
              className="text-red-600 text-sm flex items-center gap-1"
            >
              <Trash2 size={16} />
              Deletar
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}