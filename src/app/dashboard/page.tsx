import { DollarSign, Calendar, Star, TrendingUp, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Bem-vindo de volta, João Silva</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                        Exportar Relatório
                    </button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        Novo Orçamento
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Receita Total", value: "R$ 12.450,00", change: "+12.5%", icon: DollarSign, color: "text-green-600" },
                    { title: "Trabalhos Ativos", value: "3", change: "Em andamento", icon: BriefcaseIcon, color: "text-blue-600" },
                    { title: "Avaliação Média", value: "4.9", change: "Baseado em 42 reviews", icon: Star, color: "text-yellow-500" },
                    { title: "Visitas no Perfil", value: "1,234", change: "+5% vs mês passado", icon: Users, color: "text-purple-600" },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-muted-foreground">{item.title}</span>
                            <div className={cn("p-2 rounded-lg bg-muted/50", item.color)}>
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{item.value}</div>
                        <p className="text-xs text-muted-foreground">{item.change}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-7">
                {/* Financial Overview - CSS Chart */}
                <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-semibold text-lg">Visão Financeira</h3>
                        <select className="text-sm border border-border rounded-md px-2 py-1 bg-transparent">
                            <option>Últimos 6 meses</option>
                            <option>Este ano</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {[40, 70, 45, 90, 60, 85].map((h, i) => (
                            <div key={i} className="w-full bg-primary/10 rounded-t-lg relative group transition-all hover:bg-primary/20">
                                <div
                                    className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:bg-primary/80"
                                    style={{ height: `${h}%` }}
                                />
                                <div className="absolute -bottom-6 w-full text-center text-xs text-muted-foreground">
                                    {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Jobs */}
                <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-6">Agenda Próxima</h3>
                    <div className="space-y-6">
                        {[
                            { client: "Maria Oliveira", service: "Reparo Elétrico", time: "Hoje, 14:00", status: "Confirmado" },
                            { client: "Academia Fit", service: "Manutenção Preventiva", time: "Amanhã, 09:00", status: "Pendente" },
                            { client: "Condomínio Flores", service: "Instalação", time: "19/02, 10:30", status: "Confirmado" },
                        ].map((job, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                        {job.client[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{job.client}</p>
                                        <p className="text-xs text-muted-foreground">{job.service}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {job.time}
                                    </p>
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        job.status === "Confirmado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    )}>
                                        {job.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
