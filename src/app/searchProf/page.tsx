"use client";

import { useState } from "react";
import { MapPin, Filter, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Service = {
  id: number;
  title: string;
  client: string;
  distance: number;
  neighborhood: string;
  price: string;
  description: string;
  postedAt: string;
};

const allServices: Service[] = [
  {
    id: 1,
    title: "Pintura de apartamento 60m²",
    client: "João Silva",
    distance: 2.3,
    neighborhood: "Centro",
    price: "R$ 1.200",
    description: "Preciso pintar sala, 2 quartos e corredor. Tinta já comprada.",
    postedAt: "Hoje",
  },
  {
    id: 2,
    title: "Pintura externa de sobrado",
    client: "Mariana Costa",
    distance: 4.8,
    neighborhood: "Mooca",
    price: "R$ 2.800",
    description: "Casa de 2 andares. Necessário lavar parede antes.",
    postedAt: "Há 2 horas",
  },
  {
    id: 3,
    title: "Pintura comercial - loja",
    client: "Ricardo Almeida",
    distance: 6.5,
    neighborhood: "Pinheiros",
    price: "R$ 3.500",
    description: "Loja de 120m². Preciso finalizar antes de sexta.",
    postedAt: "Ontem",
  },
  {
    id: 4,
    title: "Pintura de quarto infantil",
    client: "Fernanda Lima",
    distance: 9.2,
    neighborhood: "Vila Mariana",
    price: "R$ 750",
    description: "Quarto pequeno. Trocar cor rosa para bege.",
    postedAt: "Hoje",
  },
  {
    id: 5,
    title: "Textura e pintura de parede",
    client: "Carlos Mendes",
    distance: 12.5,
    neighborhood: "Tatuapé",
    price: "R$ 1.600",
    description: "Aplicar textura e pintura em sala.",
    postedAt: "Há 1 dia",
  },
  {
    id: 6,
    title: "Pintura de garagem",
    client: "Luciana Rocha",
    distance: 15.2,
    neighborhood: "Santana",
    price: "R$ 1.100",
    description: "Garagem para 2 carros. Piso e paredes.",
    postedAt: "Hoje",
  },
  {
    id: 7,
    title: "Reforma completa pintura",
    client: "Eduardo Martins",
    distance: 18.7,
    neighborhood: "Itaim Bibi",
    price: "R$ 4.200",
    description: "Apartamento 90m² completo.",
    postedAt: "Há 3 dias",
  },
  {
    id: 8,
    title: "Pintura rápida sala e cozinha",
    client: "Beatriz Souza",
    distance: 1.5,
    neighborhood: "Bela Vista",
    price: "R$ 950",
    description: "Urgente, preciso para esta semana.",
    postedAt: "Hoje",
  },
  {
    id: 9,
    title: "Pintura predial pequena",
    client: "Condomínio Solar",
    distance: 7.1,
    neighborhood: "Brooklin",
    price: "R$ 6.000",
    description: "Manutenção fachada pequena.",
    postedAt: "Ontem",
  },
  {
    id: 10,
    title: "Pintura simples apartamento alugado",
    client: "Gabriel Nunes",
    distance: 3.6,
    neighborhood: "Liberdade",
    price: "R$ 900",
    description: "Entrega de imóvel.",
    postedAt: "Hoje",
  },
  {
    id: 11,
    title: "Pintura externa muro",
    client: "Patrícia Gomes",
    distance: 22.4,
    neighborhood: "Morumbi",
    price: "R$ 1.300",
    description: "Muro 20 metros lineares.",
    postedAt: "Hoje",
  },
];

export default function PainterSearchPage() {
  const [radius, setRadius] = useState(10);
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredServices = allServices
    .filter((service) => service.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, visibleCount);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Serviços de Pintura Disponíveis</h1>
          <p className="text-muted-foreground">
            Mostrando serviços até {radius}km de distância
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <select
            className="border border-border rounded-lg px-3 py-2 text-sm"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={30}>30 km</option>
          </select>
        </div>
      </div>

      {/* Caso não haja serviços */}
      {filteredServices.length === 0 && (
        <div className="text-center py-16 border rounded-2xl bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">
            Nenhum serviço encontrado no seu raio atual
          </h2>
          <p className="text-muted-foreground mb-4">
            Aumente seu raio de atuação para visualizar mais oportunidades.
          </p>
        </div>
      )}

      {/* Lista de Serviços */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between mb-3">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
                Pintura
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {service.postedAt}
              </span>
            </div>

            <h3 className="font-bold text-lg mb-2">{service.title}</h3>

            <p className="text-sm text-muted-foreground mb-4">
              {service.description}
            </p>

            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              {service.distance} km • {service.neighborhood}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Orçamento</p>
                <p className="font-bold">{service.price}</p>
              </div>
              <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90">
                Enviar Proposta
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botão carregar mais */}
      {visibleCount < filteredServices.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  );
}
