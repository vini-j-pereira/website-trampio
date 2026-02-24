"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Loader2, MapPin, Clock, AlertTriangle, Briefcase, X, Filter,
  ZoomIn, CheckCircle2, ChevronRight
} from "lucide-react";
import { searchApi, OpenServiceRequest } from "@/store/api/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfileThunk, selectProfile } from "@/store/slices/profileSlice";
import { updateProfileThunk } from "@/store/slices/profileSlice";
import { cn } from "@/lib/utils";

// ── Radius → scope mapping ───────────────────────────────
// Since we don't have lat/lng, we approximate using city/state/country scopes.
// ≤ 30 km → city scope, ≤ 200 km → state scope, > 200 km → country (all)
function radiusToScope(km: number): 'city' | 'state' | 'country' {
  if (km <= 30) return 'city';
  if (km <= 200) return 'state';
  return 'country';
}

// When expanding, suggest the next logical radius step
function nextRadius(current: number): number {
  if (current <= 10) return 30;
  if (current <= 30) return 75;
  if (current <= 75) return 150;
  if (current <= 150) return 300;
  return 500;
}

const URGENCY_CONFIG = {
  URGENTE: { label: "Urgente", cls: "bg-red-100 text-red-700 border-red-200" },
  NORMAL: { label: "Normal", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  FLEXIVEL: { label: "Flexível", cls: "bg-green-100 text-green-700 border-green-200" },
} as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

function RequestCard({ req }: { req: OpenServiceRequest }) {
  const urgency = URGENCY_CONFIG[req.urgency] ?? URGENCY_CONFIG.NORMAL;
  const location = [req.client?.city, req.client?.state].filter(Boolean).join(", ");

  return (
    <div className="bg-white border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {req.client?.avatar_url
              ? <img src={req.client.avatar_url} className="h-10 w-10 rounded-full object-cover" alt="" />
              : <Briefcase className="h-5 w-5 text-primary" />}
          </div>
          <div>
            <p className="text-sm font-medium">{req.client?.name ?? "Cliente"}</p>
            {location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {location}
              </p>
            )}
          </div>
        </div>
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0", urgency.cls)}>
          {urgency.label}
        </span>
      </div>

      <div>
        <h3 className="font-semibold text-base mb-1">{req.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {timeAgo(req.created_at)}
        </p>
        <button className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          Manifestar interesse
        </button>
      </div>
    </div>
  );
}

export default function DashboardSearchPage() {
  const dispatch = useAppDispatch();
  const { data: profileData } = useAppSelector(selectProfile);
  const provider = profileData?.providerProfile;

  const [query, setQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [results, setResults] = useState<OpenServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Active radius for this search session (may differ from saved profile radius)
  const [activeRadius, setActiveRadius] = useState<number>(provider?.radius_km ?? 30);
  const [expandLoading, setExpandLoading] = useState(false);
  const [savedNewRadius, setSavedNewRadius] = useState(false);

  // Keep activeRadius in sync when profile loads
  useEffect(() => {
    if (provider?.radius_km && !expandLoading) {
      setActiveRadius(provider.radius_km);
    }
  }, [provider?.radius_km]);

  const [areaFallback, setAreaFallback] = useState(false);

  const doSearch = useCallback(async (
    q?: string,
    urgency?: string,
    radiusKm?: number,
  ) => {
    setLoading(true);
    setError("");
    setSavedNewRadius(false);
    setAreaFallback(false);
    const km = radiusKm ?? activeRadius;
    const scope = radiusToScope(km);

    const baseParams = {
      q: q || undefined,
      urgency: urgency || undefined,
      city: scope === 'city' ? (provider?.city || undefined) : undefined,
      state: scope !== 'country' ? (provider?.state || undefined) : undefined,
      scope,
    };

    try {
      // First attempt: match by provider area keywords
      let data = await searchApi.requests({
        ...baseParams,
        area: provider?.area || undefined,
      });

      // Fallback: if area keyword filter returned nothing (and user isn't searching manually),
      // retry without area so location-based results still show up
      if (data.length === 0 && provider?.area && !q) {
        data = await searchApi.requests(baseParams);
        if (data.length > 0) setAreaFallback(true);
      }

      setResults(data);
    } catch {
      setError("Não foi possível carregar os pedidos. Verifique sua conexão.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [activeRadius, provider]);

  // Fetch profile on mount if not yet loaded, then search
  useEffect(() => {
    if (!profileData) dispatch(fetchProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (provider !== undefined) doSearch(query, urgencyFilter, provider?.radius_km ?? activeRadius);
  }, [provider]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query, urgencyFilter);
  };

  const clearFilters = () => {
    setQuery(""); setUrgencyFilter("");
    doSearch("", "", activeRadius);
  };

  // Expand radius: update local state, re-search, optionally save to profile
  const handleExpandRadius = async (newKm: number) => {
    setExpandLoading(true);
    setActiveRadius(newKm);
    await doSearch(query, urgencyFilter, newKm);
    setExpandLoading(false);
  };

  const saveExpandedRadius = async () => {
    if (!provider) return;
    await dispatch(updateProfileThunk({ radius_km: activeRadius }));
    setSavedNewRadius(true);
  };

  const hasFilters = query || urgencyFilter;
  const suggestedRadius = nextRadius(activeRadius);
  const isExpanded = provider && activeRadius > (provider.radius_km ?? 30);
  const noResults = !loading && !error && results.length === 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Pedidos em Aberto</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
          {provider?.area
            ? <>Área: <span className="font-medium text-foreground">{provider.area}</span></>
            : "Serviços para você"
          }
          {provider?.city && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{provider.city}{provider.state ? `, ${provider.state}` : ""}</span>
            </>
          )}
          <span className="text-muted-foreground/40">·</span>
          <span>Raio: {activeRadius} km</span>
        </p>
      </div>

      {/* Expanded radius banner */}
      {isExpanded && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <ZoomIn className="h-4 w-4 shrink-0" />
            <span>Você está vendo resultados num raio expandido de <strong>{activeRadius} km</strong>.</span>
          </div>
          {savedNewRadius
            ? <span className="flex items-center gap-1 text-green-700 font-medium shrink-0"><CheckCircle2 className="h-4 w-4" /> Salvo!</span>
            : <button onClick={saveExpandedRadius} className="text-amber-700 font-semibold underline underline-offset-2 hover:text-amber-900 transition shrink-0">Salvar como meu raio</button>
          }
        </div>
      )}

      {/* Search + filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={urgencyFilter}
            onChange={(e) => { setUrgencyFilter(e.target.value); doSearch(query, e.target.value); }}
            className="pl-9 pr-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
          >
            <option value="">Toda urgência</option>
            <option value="URGENTE">🔴 Urgente</option>
            <option value="NORMAL">🟡 Normal</option>
            <option value="FLEXIVEL">🟢 Flexível</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Search className="h-4 w-4" /> Buscar
        </button>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="px-3 py-2.5 border border-border rounded-xl bg-white text-muted-foreground hover:bg-muted text-sm flex items-center gap-1">
            <X className="h-4 w-4" /> Limpar
          </button>
        )}
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground text-sm">Buscando pedidos{provider?.city ? ` em ${provider.city}` : ""}…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-4 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* No results — offer radius expansion */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="h-9 w-9 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Nenhum pedido encontrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {hasFilters
                ? "Nenhum pedido corresponde aos filtros no seu raio atual."
                : `Não há pedidos${provider?.area ? ` de ${provider.area}` : ""} na sua área num raio de ${activeRadius} km.`}
            </p>
          </div>

          {/* Expand radius options */}
          {activeRadius < 500 && (
            <div className="bg-white border border-border rounded-2xl p-5 w-full max-w-sm text-left shadow-sm">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-primary" /> Ampliar raio de busca
              </p>
              <div className="space-y-2">
                {[suggestedRadius, ...(suggestedRadius < 300 ? [300] : []), 500]
                  .filter((r, i, arr) => arr.indexOf(r) === i && r > activeRadius && r <= 500)
                  .slice(0, 3)
                  .map(km => {
                    const scope = radiusToScope(km);
                    const scopeLabel = scope === 'city' ? 'mesma cidade' : scope === 'state' ? 'mesmo estado' : 'todo o Brasil';
                    return (
                      <button
                        key={km}
                        onClick={() => handleExpandRadius(km)}
                        disabled={expandLoading}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition group"
                      >
                        <div className="text-left">
                          <p className="text-sm font-semibold">{km} km</p>
                          <p className="text-xs text-muted-foreground">Buscar no {scopeLabel}</p>
                        </div>
                        {expandLoading
                          ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          : <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />}
                      </button>
                    );
                  })}
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-3 text-xs text-primary hover:underline w-full text-center">
                  Ou limpar filtros e tentar novamente
                </button>
              )}
            </div>
          )}

          {activeRadius >= 500 && hasFilters && (
            <button onClick={clearFilters} className="text-sm text-primary hover:underline">
              Limpar filtros e tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} pedido{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
              {provider?.city && <> em <span className="font-medium text-foreground">{provider.city}</span></>}
              {" "}· raio {activeRadius} km
            </p>
            {areaFallback && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                Resultados por localização
              </span>
            )}
          </div>

          {areaFallback && (
            <div className="rounded-xl bg-blue-50/50 border border-blue-100 px-4 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold">Nenhum pedido de "{provider?.area}" encontrado.</p>
                <p className="opacity-80">Mostrando outros pedidos em aberto na sua região enquanto novos serviços na sua área não surgem.</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => <RequestCard key={r.id} req={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
