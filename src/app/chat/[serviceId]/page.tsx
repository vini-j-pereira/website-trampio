"use client";

import { services } from "../../../lib/mockServices";
import { useState } from "react";

export default function ChatPage({
  params,
}: {
  params: { serviceId: string };
}) {
  const service = services.find(
    (s) => s.id === Number(params.serviceId)
  );

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Chat com {service?.client}
      </h1>

      <div className="border rounded-xl p-4 h-96 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="bg-muted p-2 rounded-lg text-sm">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua proposta..."
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={() => {
            setMessages([...messages, message]);
            setMessage("");
          }}
          className="px-4 py-2 bg-foreground text-background rounded-lg"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
