import ServiceCard from "@/components/ServiceCard";
import { services } from "@/lib/mockServices";

export default function SearchPage() {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
        />
      ))}
    </div>
  );
}

