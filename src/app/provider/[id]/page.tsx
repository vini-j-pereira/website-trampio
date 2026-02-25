"use client";

import { useEffect, useState, use } from "react";
import {
    MapPin,
    Star,
    Calendar,
    MessageCircle,
    ChevronLeft,
    Briefcase,
    Award,
    Clock,
    CheckCircle2,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchApi, ProviderSearchResult } from "@/store/api/api";
import { cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ProviderProfilePage({ params }: PageProps) {
    const router = useRouter();
    const { id } = use(params);
    const [provider, setProvider] = useState<ProviderSearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProvider() {
            try {
                const data = await searchApi.getProvider(id);
                setProvider(data);
            } catch (err) {
                setError("Profissional não encontrado ou erro de conexão.");
            } finally {
                setLoading(false);
            }
        }
        loadProvider();
    }, [id]);

    const handleContact = () => {
        // Redirect to chat with the provider. 
        // We'll use the user_id (the owner of the provider profile) to initiate chat.
        if (provider) {
            router.push(`/chat?with=${provider.user_id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    if (error || !provider) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 px-4 text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold">{error || "Ops! Algo deu errado."}</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                    Não conseguimos encontrar o perfil deste profissional no momento.
                </p>
                <Link href="/search" className="px-6 py-2 bg-primary text-white rounded-xl font-medium">
                    Voltar para a busca
                </Link>
            </div>
        );
    }

    const initials = provider.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-muted/20">
            {/* Header / Banner area */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-primary to-primary/80 relative">
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl transition-all text-sm font-medium"
                    >
                        <ChevronLeft className="h-4 w-4" /> Voltar
                    </button>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 -mt-24 pb-20 relative z-20">
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl border border-border shadow-xl p-6 text-center">
                            <div className="relative mx-auto -mt-20 mb-4">
                                <div className="h-32 w-32 rounded-3xl bg-white p-1 shadow-2xl mx-auto overflow-hidden">
                                    <div className="h-full w-full rounded-[20px] bg-primary flex items-center justify-center overflow-hidden">
                                        {provider.avatar_url ? (
                                            <img src={provider.avatar_url} alt={provider.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white text-4xl font-bold">{initials}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={cn(
                                    "absolute bottom-1 right-1/2 translate-x-12 h-6 w-6 rounded-full border-4 border-white",
                                    provider.availability === "AVAILABLE" ? "bg-green-500" :
                                        provider.availability === "BUSY" ? "bg-yellow-500" : "bg-red-500"
                                )} />
                            </div>

                            <h1 className="text-2xl font-bold">{provider.name}</h1>
                            {provider.company_name && (
                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                    {provider.company_name}
                                </p>
                            )}
                            <p className="text-primary font-semibold mt-2 flex items-center justify-center gap-1.5">
                                <Briefcase className="h-4 w-4" /> {provider.area}
                            </p>

                            <div className="mt-4 flex items-center justify-center gap-4">
                                <div className="text-center">
                                    <div className="text-xl font-bold flex items-center gap-1">
                                        {provider.rating > 0 ? provider.rating.toFixed(1) : "—"}
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Avaliação</p>
                                </div>
                                <div className="w-px h-8 bg-border" />
                                <div className="text-center">
                                    <div className="text-xl font-bold">{provider.rating_count}</div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Serviços</p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={handleContact}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                                >
                                    <MessageCircle className="h-5 w-5" /> Entrar em Contato
                                </button>
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" /> Responde em média em 2 horas
                                </div>
                            </div>
                        </div>

                        {/* Quick info */}
                        <div className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Informações rápidas</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold">{provider.city}, {provider.state}</p>
                                        <p className="text-xs text-muted-foreground">Atende num raio de {provider.radius_km}km</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                        <Award className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold">{provider.experience_yrs} anos de experiência</p>
                                        <p className="text-xs text-muted-foreground">Profissional Verificado</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bio and Portfolio */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Section */}
                        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Sobre o Profissional</h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {provider.bio || "Este profissional ainda não preencheu sua descrição, mas você pode entrar em contato para saber mais sobre seus serviços e experiência."}
                            </p>

                            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                                    <Calendar className="h-5 w-5 text-primary mb-2" />
                                    <h4 className="font-bold text-sm">Próxima Vaga</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Geralmente em 3 dias</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                                    <Award className="h-5 w-5 text-primary mb-2" />
                                    <h4 className="font-bold text-sm">Destaque</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Pontualidade nota 10</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                                    <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                                    <h4 className="font-bold text-sm">Garantia</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Garantia de 90 dias</p>
                                </div>
                            </div>
                        </div>

                        {/* Showcase / Portfolio (Placeholder for now) */}
                        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Trabalhos Realizados</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="aspect-square rounded-2xl bg-muted/50 border border-border flex items-center justify-center group relative overflow-hidden">
                                        <Briefcase className="h-8 w-8 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-xs text-muted-foreground mt-6">
                                Mais fotos e projetos estarão disponíveis em breve.
                            </p>
                        </div>

                        {/* Reviews (Placeholder) */}
                        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Avaliações</h2>
                                <button className="text-primary text-sm font-semibold hover:underline">Ver todas</button>
                            </div>

                            {provider.rating_count === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                                    Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-sm">Ana Silva</p>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">Há 2 semanas</p>
                                            <p className="text-sm text-muted-foreground">Excelente profissional, muito educado e fez um trabalho impecável na minha casa. Recomendo com certeza!</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
