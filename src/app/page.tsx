import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
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
    <div className="flex flex-col min-h-screen">

      {/* HERO */}
      <section className="pt-24 pb-24">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl">
          <p className="text-primary font-medium mb-4">
            Para contratar ou trabalhar — a Trampio é o seu lugar
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            A plataforma que conecta quem precisa contratar
            <span className="text-primary block">
              com quem quer crescer profissionalmente.
            </span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10">
            Rápido, fácil e seguro para quem contrata. Poderoso e completo
            para quem trabalha.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-4 bg-primary text-white rounded-lg font-semibold"
            >
              Quero contratar
            </Link>

            <Link
              href="/register?type=professional"
              className="px-8 py-4 border rounded-lg font-semibold"
            >
              Quero trabalhar
            </Link>
          </div>
        </div>
      </section>

      {/* CONTRATANTE */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-14 items-center">

          <div>
            <h2 className="text-3xl font-bold mb-6">
              Contratar serviços nunca foi tão simples
            </h2>

            <p className="text-muted-foreground mb-8">
              Em poucos cliques você descreve o que precisa, recebe orçamentos
              de profissionais próximos e escolhe a melhor opção com total
              segurança.
            </p>

            <div className="space-y-4">
              {[
                "Crie um serviço em poucos cliques",
                "Receba orçamentos rapidamente",
                "Pesquise e negocie direto com profissionais",
                "Perfis avaliados e confiáveis",
                "Totalmente gratuito para contratar",
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
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
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA CONTRATANTE */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h3 className="text-3xl font-bold mb-10">
            Como contratar na Trampio
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Descreva o serviço que você precisa",
              "Receba orçamentos de profissionais próximos",
              "Escolha, converse e agende com segurança",
            ].map((step, i) => (
              <div key={i} className="p-6 border rounded-2xl bg-white">
                <div className="text-primary font-bold text-2xl mb-3">
                  0{i + 1}
                </div>
                <p className="text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFISSIONAL */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-14 items-center">

          <div className="rounded-2xl overflow-hidden border shadow-xl">
            <Image
              src="/images/ultra-realistic-product-photography-of-a-modern-sm (3).jpeg"
              alt="Dashboard profissional"
              width={900}
              height={700}
              className="w-full"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">
              Uma plataforma criada para o crescimento do profissional
            </h2>

            <p className="text-muted-foreground mb-8">
              A Trampio ajuda você a ser encontrado na internet, conquistar
              novos clientes e organizar toda a gestão da sua empresa — seja
              ela pequena, média ou grande.
            </p>

            <div className="space-y-4">
              {[
                { icon: Search, text: "Mais visibilidade e novos clientes" },
                { icon: Users, text: "Perfil profissional completo e confiável" },
                { icon: Calendar, text: "Agenda organizada automaticamente" },
                { icon: Bell, text: "Lembretes e notificações inteligentes" },
                { icon: BarChart3, text: "Relatórios do dia, semana e mês" },
                { icon: Wallet, text: "Controle de despesas, lucro e crescimento" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex gap-3">
                    <Icon className="h-5 w-5 text-primary mt-1" />
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD DEEP */}
      <section className="py-24 bg-muted/20 border-t">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl">
          <Briefcase className="mx-auto h-10 w-10 text-primary mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Gestão completa do seu negócio em um único dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Acompanhe evolução diária, semanal e mensal da sua empresa. Agenda,
            logística, clientes, finanças e produtividade organizados para que
            você foque no que realmente importa: crescer.
          </p>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl">
          <Shield className="mx-auto h-10 w-10 text-primary mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Segurança e confiança para todos
          </h2>
          <p className="text-muted-foreground text-lg">
            Perfis verificados, avaliações reais e uma plataforma pensada para
            criar relações de confiança entre clientes e profissionais.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-primary text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Para contratar ou trabalhar — a Trampio é o seu lugar.
        </h2>
        <p className="mb-8 opacity-90">
          Comece agora e faça parte de uma nova forma de contratar e crescer.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/search"
            className="px-8 py-4 bg-white text-primary rounded-lg font-semibold"
          >
            Contratar um serviço
          </Link>

          <Link
            href="/register?type=professional"
            className="px-8 py-4 border border-white rounded-lg font-semibold"
          >
            Criar perfil profissional
          </Link>
        </div>
      </section>
    </div>
  );
}
