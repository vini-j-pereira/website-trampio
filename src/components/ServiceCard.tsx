"use client";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Service } from "../lib/mockServices";

type Props = {
  service: Service;
};

export default function ServiceCard({ service }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-all">
      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
        Pintura
      </span>

      <h3 className="font-bold text-lg mt-3 mb-2">{service.title}</h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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

        <Link
          href={`/services/${service.id}`}
          className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}