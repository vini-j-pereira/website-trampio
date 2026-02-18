import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Search,
  Calendar,
  Bell,
  Wallet,
  BarChart3,
  Users,
  Shield,
  Briefcase,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">

      {/* HERO */}
      <section className="pt-20 pb-28 w-full">
        <div className="max-w-7xl mx-auto w-full px-6 text-center">
          <div className="max-w-4xl mx-auto">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Para contratar ou trabalhar — a Trampio é o seu lugar
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              A plataforma que conecta quem precisa contratar
              <span className="text-primary block mt-2">
                com quem quer crescer profissionalmente.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12">
              Rápido, fácil e seguro para quem contrata. Poderoso e completo
              para quem trabalha.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Quero contratar
              </Link>

              <Link
                href="/register?type=professional"
                className="px-8 py-4 border border-border rounded-lg font-semibold hover:bg-muted transition"
              >
                Quero trabalhar
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CONTRATANTE */}
      <section className="py-28 border-t w-full">
        <div className="max-w-7xl mx-auto w-full px-6 grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
              Contratar serviços nunca foi tão simples
            </h2>

            <p className="text-muted-foreground mb-10 text-lg">
              Em poucos cliques você descreve o que precisa, recebe orçamentos
              de profissionais próximos e escolhe a melhor opção com total
              segurança.
            </p>

            <div className="space-y-5">
              {[
                "Crie um serviço em poucos cliques",
                "Receba orçamentos rapidamente",
                "Pesquise e negocie direto com profissionais",
                "Perfis avaliados e confiáveis",
                "Totalmente gratuito para contratar",
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border shadow-xl">
            <Image
              src="/images/ultra-realistic-professional-photography-real-huma.jpeg"
              alt="Cliente contratando serviço"
              width={900}
              height={600}
              className="w-full h-auto"
            />
          </div>

        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-24 bg-muted/20 w-full">
        <div className="max-w-7xl mx-auto w-full px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-14">
            Como contratar na Trampio
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Descreva o serviço que você precisa",
              "Receba orçamentos de profissionais próximos",
              "Escolha, converse e agende com segurança",
            ].map((step, i) => (
              <div
                key={i}
                className="p-8 border rounded-2xl bg-white shadow-sm"
              >
                <div className="text-primary font-bold text-2xl mb-4">
                  0{i + 1}
                </div>
                <p className="text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFISSIONAL */}
      <section className="py-28 border-t w-full">
        <div className="max-w-7xl mx-auto w-full px-6 grid lg:grid-cols-2 gap-16 items-center">

          <div className="rounded-2xl overflow-hidden border shadow-xl">
            <Image
              src="/images/ultra-realistic-product-photography-of-a-modern-sm (3).jpeg"
              alt="Dashboard profissional"
              width={900}
              height={700}
              className="w-full h-auto"
            />
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
              Uma plataforma criada para o crescimento do profissional
            </h2>

            <p className="text-muted-foreground mb-10 text-lg">
              A Trampio ajuda você a ser encontrado na internet, conquistar
              novos clientes e organizar toda a gestão da sua empresa.
            </p>

            <div className="space-y-5">
              {[
                { icon: Search, text: "Mais visibilidade e novos clientes" },
                { icon: Users, text: "Perfil profissional completo e confiável" },
                { icon: Calendar, text: "Agenda organizada automaticamente" },
                { icon: Bell, text: "Lembretes e notificações inteligentes" },
                { icon: BarChart3, text: "Relatórios do dia, semana e mês" },
                { icon: Wallet, text: "Controle financeiro e crescimento" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex gap-3">
                    <Icon className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* DASHBOARD */}
      <section className="py-28 bg-muted/20 border-t w-full">
        <div className="max-w-4xl mx-auto w-full px-6 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-primary mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Gestão completa do seu negócio em um único dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Agenda, clientes, finanças e produtividade organizados para que
            você foque no que realmente importa: crescer.
          </p>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="py-28 border-t w-full">
        <div className="max-w-4xl mx-auto w-full px-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Segurança e confiança para todos
          </h2>
          <p className="text-muted-foreground text-lg">
            Perfis verificados, avaliações reais e uma plataforma pensada para
            criar relações de confiança.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 bg-primary text-white text-center w-full">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Para contratar ou trabalhar — a Trampio é o seu lugar.
          </h2>

          <p className="mb-10 opacity-90 text-lg">
            Comece agora e faça parte de uma nova forma de contratar e crescer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:opacity-90 transition"
            >
              Contratar um serviço
            </Link>

            <Link
              href="/register?type=professional"
              className="px-8 py-4 border border-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Criar perfil profissional
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
