"use client";

import { Search, MapPin, Star, Filter, Loader2, X, Briefcase, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchApi, ProviderSearchResult } from "@/store/api/api";
import { SERVICE_AREAS_GROUPED } from "@/lib/serviceAreas";

const AVAILABILITY_LABELS: Record<string, string> = {
    AVAILABLE: "✅ Disponível",
    BUSY: "🟡 Ocupado",
    VACATION: "🔴 De férias",
};

function getInitials(name: string) {
    const parts = name.trim().split(" ");
    return parts.length === 1
        ? parts[0][0].toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StarRating({ rating, count }: { rating: number; count: number }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={cn(
                            "h-3.5 w-3.5",
                            s <= Math.round(rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted"
                        )}
                    />
                ))}
            </div>
            <span className="text-xs text-muted-foreground">
                {rating > 0 ? rating.toFixed(1) : "Novo"} {count > 0 && `(${count})`}
            </span>
        </div>
    );
}

function ProviderCard({ p }: { p: ProviderSearchResult }) {
    const location = [p.city, p.state].filter(Boolean).join(", ");
    return (
        <div className="group bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col">
            {/* Cover */}
            <div className="relative h-36 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">{getInitials(p.name)}</span>
                    </div>
                )}
                {/* availability badge */}
                <span className={cn(
                    "absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full",
                    p.availability === "AVAILABLE" ? "bg-green-100 text-green-700" :
                        p.availability === "BUSY" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-600"
                )}>
                    {p.availability === "AVAILABLE" ? "✅ Disponível" :
                        p.availability === "BUSY" ? "🟡 Ocupado" : "🔴 Férias"}
                </span>
                {/* area badge */}
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-primary text-[10px] font-bold uppercase tracking-wider text-white inline-block">
                    {p.area}
                </span>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                <h3 className="font-bold text-base">{p.name}</h3>

                {location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {location}
                    </div>
                )}

                <StarRating rating={p.rating} count={p.rating_count} />

                {p.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.bio}</p>
                )}

                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                        {p.experience_yrs > 0 ? `${p.experience_yrs} ano${p.experience_yrs !== 1 ? "s" : ""} de experiência` : "Profissional novo"}
                    </div>
                    <Link
                        href={`/provider/${p.id}`}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                        Ver Perfil
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("q") ?? "");
    const [activeArea, setActiveArea] = useState(searchParams.get("service") ?? searchParams.get("area") ?? "todos");
    const [cityFilter, setCityFilter] = useState(searchParams.get("city") ?? "");
    const [showFilters, setShowFilters] = useState(false);
    const [availFilter, setAvailFilter] = useState("");

    const [results, setResults] = useState<ProviderSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

    const doSearch = useCallback(async (params: {
        q?: string; area?: string; city?: string; availability?: string;
    }) => {
        setLoading(true);
        setError("");
        setSearched(true);
        try {
            const data = await searchApi.providers(params);
            setResults(data);
        } catch {
            setError("Não foi possível conectar ao servidor. Tente novamente.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Run search on mount if there are URL params
    useEffect(() => {
        const q = searchParams.get("q") ?? "";
        const area = searchParams.get("service") ?? searchParams.get("area") ?? "";
        const city = searchParams.get("city") ?? "";

        if (q || (area && area !== "todos") || city) {
            setQuery(q);
            setActiveArea(area || "todos");
            setCityFilter(city);
            doSearch({ q: q || undefined, area: area || undefined, city: city || undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (activeArea !== "todos") params.set("area", activeArea);
        if (cityFilter.trim()) params.set("city", cityFilter.trim());
        router.replace(`/search?${params.toString()}`);
        doSearch({
            q: query.trim() || undefined,
            area: activeArea !== "todos" ? activeArea : undefined,
            city: cityFilter.trim() || undefined,
            availability: availFilter || undefined,
        });
    };

    const handleAreaPill = (slug: string) => {
        const area = slug === "todos" ? "" : slug;
        setActiveArea(slug);
        doSearch({
            q: query.trim() || undefined,
            area: area || undefined,
            city: cityFilter.trim() || undefined,
            availability: availFilter || undefined,
        });
    };

    const clearAll = () => {
        setQuery("");
        setActiveArea("todos");
        setCityFilter("");
        setAvailFilter("");
        setResults([]);
        setSearched(false);
        router.replace("/search");
    };

    // All service types flattened for pills (top categories)
    const topAreas = [
        { slug: "todos", name: "Todos" },
        ...SERVICE_AREAS_GROUPED.slice(0, 6).flatMap((g) => g.items.slice(0, 2)).map((item) => ({
            slug: item,
            name: item,
        })),
    ];

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Encontre Profissionais</h1>
                    <p className="text-muted-foreground mt-1">Busque prestadores cadastrados na plataforma</p>
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Nome, área ou cidade..."
                            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-primary text-white rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                        <Search className="h-4 w-4" />
                        <span className="hidden sm:inline">Buscar</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "px-4 py-2.5 border rounded-xl flex items-center gap-2 text-sm transition-colors",
                            showFilters ? "bg-primary/10 border-primary/30 text-primary" : "bg-white border-border hover:bg-muted"
                        )}
                    >
                        <Filter className="h-4 w-4" /> Filtros {showFilters ? <ChevronDown className="h-3 w-3 rotate-180" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {searched && (
                        <button type="button" onClick={clearAll}
                            className="px-3 py-2.5 border border-border rounded-xl bg-white text-muted-foreground hover:bg-muted text-sm transition-colors flex items-center gap-1">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </form>

                {/* Extra filters */}
                {showFilters && (
                    <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-white border border-border">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">Cidade</label>
                            <input
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                placeholder="Ex: São Paulo"
                                className="h-9 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">Disponibilidade</label>
                            <select
                                value={availFilter}
                                onChange={(e) => setAvailFilter(e.target.value)}
                                className="h-9 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Qualquer</option>
                                <option value="AVAILABLE">✅ Disponível</option>
                                <option value="BUSY">🟡 Ocupado</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground invisible">Buscar</label>
                            <button
                                type="button"
                                onClick={() => handleSearch()}
                                className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
                            >
                                Aplicar filtros
                            </button>
                        </div>
                    </div>
                )}

                {/* Area pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {topAreas.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => handleAreaPill(cat.slug)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-colors shrink-0",
                                activeArea === cat.slug
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                    {/* advanced: show area selector */}
                    <div className="relative shrink-0">
                        <select
                            value={activeArea}
                            onChange={(e) => handleAreaPill(e.target.value)}
                            className={cn(
                                "pl-3 pr-8 py-1.5 rounded-full text-sm font-medium border appearance-none cursor-pointer transition-colors",
                                !topAreas.find(a => a.slug === activeArea)
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-muted-foreground border-border hover:bg-muted"
                            )}
                        >
                            <option value="todos">Mais serviços...</option>
                            {SERVICE_AREAS_GROUPED.map((group) => (
                                <optgroup key={group.category} label={group.category}>
                                    {group.items.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-current" />
                    </div>
                </div>

                {/* Results */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                        <p className="text-sm text-muted-foreground">Buscando profissionais...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && !searched && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Encontre o profissional certo</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Digite um nome, tipo de serviço ou cidade, ou clique em uma categoria acima para começar.
                        </p>
                    </div>
                )}

                {!loading && !error && searched && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Nenhum profissional encontrado</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Tente mudar os filtros ou buscar por outro termo.{" "}
                            <button onClick={clearAll} className="text-primary hover:underline">Limpar busca</button>
                        </p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {results.length} profissional{results.length !== 1 ? "is" : ""} encontrado{results.length !== 1 ? "s" : ""}
                        </p>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {results.map((p) => (
                                <ProviderCard key={p.id} p={p} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
