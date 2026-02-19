import { services } from "@/lib/mockServices";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default async function ServiceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const service = services.find(
    (s) => s.id === Number(id)
  );

  if (!service) return notFound();

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold">
          {service.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <MapPin className="h-4 w-4" />
          {service.distance} km • {service.neighborhood}
        </div>
      </div>

      {/* Imagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {service.images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Imagem do serviço"
            className="rounded-xl w-full h-64 object-cover"
          />
        ))}
      </div>

      {/* Descrição */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Descrição
        </h2>
        <p className="text-muted-foreground">
          {service.description}
        </p>
      </div>

      {/* Orçamento */}
      <div className="border-t pt-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Orçamento sugerido
          </p>
          <p className="text-xl font-bold">
            {service.price}
          </p>
        </div>

        <Link
          href={`/chat/${service.id}`}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
        >
          Enviar orçamento
        </Link>
      </div>
    </div>
  );
}

