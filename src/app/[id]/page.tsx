"use client";

import { services } from "../../lib/mockServices";
import { notFound, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

export default function ServiceDetails({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const service = services.find(
    (s) => s.id === Number(params.id)
  );

  if (!service) return notFound();

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">{service.title}</h1>

      {/* Galeria */}
      <div className="grid grid-cols-2 gap-4">
        {service.images.map((img, i) => (
          <img
            key={i}
            src={img}
            className="rounded-xl h-64 w-full object-cover"
          />
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          {service.description}
        </p>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          {service.distance} km • {service.neighborhood}
        </div>

        <div>
          <p className="text-muted-foreground">Orçamento sugerido</p>
          <p className="font-bold text-xl">{service.price}</p>
        </div>

        <button
          onClick={() => router.push(`/chat/${service.id}`)}
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
        >
          Enviar proposta
        </button>
      </div>
    </div>
  );
}
