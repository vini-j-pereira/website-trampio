"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, Palette, Heart, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type DesignOption = "modern" | "bold" | "warm" | "professional";

export default function DesignPreviewPage() {
  const [selected, setSelected] = useState<DesignOption>("modern");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Preview de Opções de Design</h1>
              <p className="text-sm text-muted-foreground">
                Escolha uma opção para visualizar o conceito
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Voltar ao Site
            </Link>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelected("modern")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                selected === "modern"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Moderno & Gradientes
            </button>
            <button
              onClick={() => setSelected("bold")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                selected === "bold"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Palette className="h-4 w-4" />
              Bold & Minimalista
            </button>
            <button
              onClick={() => setSelected("warm")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                selected === "warm"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Heart className="h-4 w-4" />
              Caloroso & Confiável
            </button>
            <button
              onClick={() => setSelected("professional")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                selected === "professional"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Briefcase className="h-4 w-4" />
              Profissional & Premium
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="container mx-auto px-4 py-12">
        {selected === "modern" && <ModernPreview />}
        {selected === "bold" && <BoldPreview />}
        {selected === "warm" && <WarmPreview />}
        {selected === "professional" && <ProfessionalPreview />}
      </div>

      {/* Documentation Link */}
      <div className="border-t border-border bg-muted/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            Para mais detalhes sobre cada opção, consulte a documentação completa
          </p>
          <a
            href="/.kombai/design-upgrade-options.md"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Ver Documentação Completa
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// Preview Components
function ModernPreview() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-orange-50 p-12 md:p-20">
        {/* Animated Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

        <div className="relative text-center max-w-4xl mx-auto">
          <p className="text-primary font-medium mb-4">
            Para contratar ou trabalhar — a Trampio é o seu lugar
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            A plataforma que{" "}
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              conecta pessoas
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            Rápido, fácil e seguro para quem contrata. Poderoso e completo para quem trabalha.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-primary to-orange-400 text-white rounded-xl font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/50">
              <span className="relative z-10">Quero contratar</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="px-8 py-4 bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl font-semibold hover:bg-white/80 transition-all hover:scale-105">
              Quero trabalhar
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards with Glassmorphism */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">
          Design com <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Glassmorphism</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Visibilidade", desc: "Seja encontrado facilmente" },
            { title: "Gestão Completa", desc: "Dashboard profissional" },
            { title: "Segurança", desc: "Perfis verificados" },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <CheckCircle2 className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-gradient-to-r from-primary/10 to-orange-400/10 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-2">Visual Moderno & Vibrante</h3>
        <p className="text-muted-foreground">
          Gradientes, glassmorphism, animações suaves e efeitos de profundidade
        </p>
      </div>
    </div>
  );
}

function BoldPreview() {
  return (
    <div className="space-y-24 bg-white">
      {/* Hero Section */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-8xl md:text-9xl font-black mb-8 tracking-tight leading-none">
            TRAMPIO
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-muted-foreground max-w-3xl mx-auto tracking-wide">
            A PLATAFORMA QUE CONECTA PROFISSIONAIS
          </p>
          <div className="flex gap-6 justify-center mt-16">
            <button className="px-12 py-6 bg-black text-white font-bold text-lg border-4 border-black hover:bg-white hover:text-black transition-all">
              CONTRATAR
            </button>
            <button className="px-12 py-6 bg-white text-black font-bold text-lg border-4 border-black hover:bg-black hover:text-white transition-all">
              TRABALHAR
            </button>
          </div>
        </div>
      </section>

      {/* Minimalist Cards */}
      <section className="border-t-2 border-black pt-24">
        <h2 className="text-6xl font-black mb-16 text-center">BENEFÍCIOS</h2>
        <div className="grid md:grid-cols-2 gap-px bg-black">
          {[
            { num: "01", title: "VISIBILIDADE", desc: "Seja encontrado online" },
            { num: "02", title: "GESTÃO", desc: "Dashboard completo" },
            { num: "03", title: "SEGURANÇA", desc: "Perfis verificados" },
            { num: "04", title: "CRESCIMENTO", desc: "Ferramentas pro" },
          ].map((item) => (
            <div
              key={item.num}
              className="bg-white p-12 hover:bg-black hover:text-white transition-all group"
            >
              <div className="text-6xl font-black mb-4 text-primary group-hover:text-white">
                {item.num}
              </div>
              <h3 className="text-3xl font-black mb-2">{item.title}</h3>
              <p className="text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-black text-white rounded-none p-12 text-center">
        <h3 className="text-4xl font-black mb-4">TIPOGRAFIA OUSADA</h3>
        <p className="text-xl">Minimalismo extremo com foco absoluto no conteúdo</p>
      </div>
    </div>
  );
}

function WarmPreview() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 p-12 md:p-20 border-4 border-orange-200">
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-24 h-24 border-4 border-orange-300 rounded-full opacity-20" />
        <div className="absolute bottom-4 left-4 w-32 h-32 border-4 border-amber-300 rounded-full opacity-20" />

        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-6 py-2 bg-orange-200 rounded-full">
            <p className="text-primary font-semibold">✨ Bem-vindo ao Trampio</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Conectando pessoas com{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">carinho</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-orange-200 -rotate-1" />
            </span>
          </h1>
          <p className="text-xl text-gray-700 mb-10">
            Uma plataforma feita para criar conexões verdadeiras entre profissionais e clientes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-primary text-white rounded-full font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all">
              Começar agora ❤️
            </button>
            <button className="px-8 py-4 bg-white border-2 border-orange-200 rounded-full font-semibold hover:bg-orange-50 transition-all">
              Saber mais
            </button>
          </div>
        </div>
      </section>

      {/* Warm Cards */}
      <section>
        <h2 className="text-4xl font-bold text-center mb-4">
          Por que escolher o Trampio?
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Feito com carinho para você crescer
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { emoji: "🎯", title: "Fácil de usar", color: "orange" },
            { emoji: "💼", title: "Gestão completa", color: "amber" },
            { emoji: "🛡️", title: "100% Seguro", color: "orange" },
          ].map((item, i) => (
            <div
              key={i}
              className={cn(
                "group p-8 rounded-3xl border-2 hover:scale-105 transition-all shadow-lg",
                item.color === "orange"
                  ? "bg-orange-50 border-orange-200 hover:shadow-orange-200"
                  : "bg-amber-50 border-amber-200 hover:shadow-amber-200"
              )}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                {item.emoji}
              </div>
              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-3xl p-8 text-center border-2 border-orange-200">
        <h3 className="text-3xl font-bold mb-2">Design Acolhedor 🧡</h3>
        <p className="text-lg text-gray-700">
          Cores quentes, cantos arredondados, e elementos amigáveis
        </p>
      </div>
    </div>
  );
}

function ProfessionalPreview() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block mb-4 px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded">
            PLATAFORMA PROFISSIONAL
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight font-serif">
            A solução completa para gestão de serviços
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Conecte-se com profissionais qualificados e gerencie todo o processo em uma única plataforma robusta e confiável.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Começar agora
            </button>
            <button className="px-8 py-3 border-2 border-border rounded-lg font-semibold hover:bg-muted transition-colors">
              Saber mais
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl" />
          <div className="relative bg-slate-100 rounded-xl p-8 border border-slate-200">
            <div className="space-y-4">
              <div className="h-4 bg-slate-300 rounded w-3/4" />
              <div className="h-4 bg-slate-300 rounded w-1/2" />
              <div className="h-32 bg-slate-300 rounded" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-20 bg-slate-300 rounded" />
                <div className="h-20 bg-slate-300 rounded" />
                <div className="h-20 bg-slate-300 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 text-white rounded-2xl p-12">
        <h2 className="text-4xl font-bold text-center mb-12 font-serif">
          Números que impressionam
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { num: "10k+", label: "Profissionais" },
            { num: "50k+", label: "Serviços realizados" },
            { num: "4.9", label: "Avaliação média" },
            { num: "98%", label: "Satisfação" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">{stat.num}</div>
              <div className="text-slate-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section>
        <h2 className="text-4xl font-bold mb-12 text-center font-serif">
          Recursos premium
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 border border-slate-200 rounded-xl hover:shadow-lg transition-shadow bg-white"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Feature {i}</h3>
              <p className="text-muted-foreground">
                Descrição detalhada do recurso profissional disponível na plataforma.
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-l-4 border-primary bg-slate-50 rounded-r-xl p-8">
        <h3 className="text-3xl font-bold mb-2 font-serif">Design Corporativo</h3>
        <p className="text-lg text-muted-foreground">
          Grid estruturado, tipografia serif, e aparência premium para máxima credibilidade
        </p>
      </div>
    </div>
  );
}
