import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Star, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              A plataforma definitiva de serviços
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Encontre o profissional <br />
              <span className="text-primary">ideal para você.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              De reparos domésticos a serviços digitais. Conectamos você aos melhores especialistas, com segurança e praticidade.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/search"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Contratar Serviço
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register?type=professional"
                className="w-full sm:w-auto px-8 py-4 bg-white text-foreground border border-input font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-2"
              >
                Sou Profissional
              </Link>
            </div>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pagamento Seguro</h3>
              <p className="text-muted-foreground">
                Seu dinheiro fica protegido até a conclusão do serviço. Garantia de satisfação para ambos os lados.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Profissionais Avaliados</h3>
              <p className="text-muted-foreground">
                Sistema de avaliação transparente. Contrate com confiança baseada em experiências reais de outros clientes.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rápido e Prático</h3>
              <p className="text-muted-foreground">
                Encontre, converse e feche negócio em minutos. Tudo através do nosso chat integrado e painel inteligente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">Para Profissionais</h2>
              <ul className="space-y-4">
                {[
                  "Perfil profissional detalhado com portfólio",
                  "Gestão financeira completa (Custos, Recebimentos)",
                  "Chat direto com clientes",
                  "Sistema de reputação e avaliações",
                  "Notificações de serviços próximos (Geolocalização)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-lg text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/register?type=professional"
                  className="px-6 py-3 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  Criar Perfil Profissional
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex-1 relative h-[400px] w-full bg-muted/30 rounded-2xl overflow-hidden border border-border flex items-center justify-center">
              <div className="text-muted-foreground text-center p-6">
                <p className="font-medium">Dashboard Preview</p>
                <div className="mt-4 grid grid-cols-2 gap-4 opacity-50">
                  <div className="h-24 bg-white rounded-lg shadow-sm"></div>
                  <div className="h-24 bg-white rounded-lg shadow-sm"></div>
                  <div className="col-span-2 h-32 bg-white rounded-lg shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
