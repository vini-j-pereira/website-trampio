export type Service = {
  id: number;
  title: string;
  client: string;
  distance: number;
  neighborhood: string;
  price: string;
  description: string;
  postedAt: string;
  images: string[];
};

export const services: Service[] = [
  {
    id: 1,
    title: "Pintura de apartamento 60m²",
    client: "João Silva",
    distance: 2.3,
    neighborhood: "Centro",
    price: "R$ 1.200",
    description:
      "Preciso pintar sala, 2 quartos e corredor. Tinta já comprada. Paredes em bom estado.",
    postedAt: "Hoje",
    images: [
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    ],
  },
  {
    id: 2,
    title: "Pintura externa de sobrado",
    client: "Mariana Costa",
    distance: 4.8,
    neighborhood: "Mooca",
    price: "R$ 2.800",
    description:
      "Casa de 2 andares. Necessário lavar parede antes e aplicar selador.",
    postedAt: "Há 2 horas",
    images: [
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    ],
  },
];
