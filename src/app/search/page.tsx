import { Search, MapPin, Filter, Star, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SearchPage({
    searchParams,
}: {
    searchParams: { category?: string; q?: string };
}) {
    return (
        <div className="p-8 space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Encontre Profissionais</h1>
                    <p className="text-muted-foreground">
                        Mostrando resultados para <span className="font-medium text-foreground">São Paulo, SP</span>
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar serviços..."
                            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <button className="px-4 py-2 bg-white border border-border rounded-lg flex items-center gap-2 hover:bg-muted transition-colors">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filtros</span>
                    </button>
                </div>
            </div>

            {/* Categories Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["Todos", "Pedreiro", "Eletricista", "Jardineiro", "Personal Trainer", "Advogado", "Cozinheiro"].map((cat) => (
                    <button
                        key={cat}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium border border-border whitespace-nowrap transition-colors",
                            cat === "Todos"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Professionals Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="group bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                        <div className="relative h-48 bg-muted">
                            {/* Cover Image Placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <button className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors">
                                <Heart className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-4 left-4 text-white">
                                <span className="px-2 py-0.5 rounded bg-primary text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                                    Eletricista
                                </span>
                                <h3 className="font-bold text-lg">Carlos Eduardo</h3>
                                <div className="flex items-center gap-1 text-sm text-white/90">
                                    <MapPin className="h-3 w-3" />
                                    <span>2.5 km • Centro</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center text-yellow-500 gap-0.5">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="font-bold text-sm text-foreground">4.9</span>
                                </div>
                                <span className="text-xs text-muted-foreground">(128 avaliações)</span>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                Especialista em instalações residenciais e prediais. Atendimento 24 horas para emergências.
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">A partir de</span>
                                    <p className="font-bold text-foreground">R$ 80/h</p>
                                </div>
                                <Link
                                    href={`/profile/${i}`}
                                    className="px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Ver Perfil
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
