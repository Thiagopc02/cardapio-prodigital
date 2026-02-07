"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { obterCliente } from "@/utils/clienteStorage";

/* ================= TIPOS ================= */

type ItemPedido = {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
};

type PedidoStatus = "novo" | "preparando" | "em_rota" | "finalizado";

type Pedido = {
  id: string;
  status: PedidoStatus;
  total: number;
  itens: ItemPedido[];
  createdAt?: Timestamp;
};

/* ================= COMPONENTE ================= */

export default function StatusPage() {
  const cliente =
    typeof window !== "undefined" ? obterCliente() : null;

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoNotificado, setPedidoNotificado] =
    useState<string | null>(null);

  // guarda status anterior (para notificação)
  const statusAnterior = useRef<Record<string, PedidoStatus>>({});

  useEffect(() => {
    if (!cliente) return;

    const queries = [];

    // 🔑 QUERY PRINCIPAL (CORRETA)
    if (cliente.id) {
      queries.push(
        query(
          collection(db, "pedidos"),
          where("cliente.id", "==", cliente.id),
          orderBy("createdAt", "desc")
        )
      );
    }

    // 🧯 FALLBACK (PEDIDOS ANTIGOS)
    if (cliente.telefone) {
      const telefoneFormatado = cliente.telefone.startsWith("+")
        ? cliente.telefone
        : `+55${cliente.telefone.replace(/\D/g, "")}`;

      queries.push(
        query(
          collection(db, "pedidos"),
          where("cliente.telefone", "==", telefoneFormatado),
          orderBy("createdAt", "desc")
        )
      );
    }

    if (queries.length === 0) return;

    // 🔥 LISTENERS EM PARALELO
    const unsubscribes = queries.map((q) =>
      onSnapshot(q, (snapshot) => {
        setPedidos((prev) => {
          const mapa = new Map(prev.map((p) => [p.id, p]));

          snapshot.docs.forEach((doc) => {
            const data = doc.data() as Omit<Pedido, "id">;

            const statusAnt = statusAnterior.current[doc.id];

            if (statusAnt && statusAnt !== data.status) {
              setPedidoNotificado(doc.id);
              setTimeout(() => setPedidoNotificado(null), 4000);
            }

            statusAnterior.current[doc.id] = data.status;

            mapa.set(doc.id, { id: doc.id, ...data });
          });

          return Array.from(mapa.values()).sort((a, b) => {
            const ta = a.createdAt?.seconds ?? 0;
            const tb = b.createdAt?.seconds ?? 0;
            return tb - ta;
          });
        });

        setLoading(false);
      })
    );

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [cliente?.id, cliente?.telefone]);

  /* ================= UI ================= */

  if (!cliente) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2">
          📦 Acompanhar pedidos
        </h1>
        <p className="text-zinc-400">
          Nenhum cliente identificado neste dispositivo.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        📦 Acompanhar pedidos
      </h1>

      {loading && (
        <p className="text-zinc-400">Carregando pedidos...</p>
      )}

      {!loading && pedidos.length === 0 && (
        <p className="text-zinc-400">
          Nenhum pedido encontrado.
        </p>
      )}

      <div className="space-y-4">
        {pedidos.map((p) => (
          <div
            key={p.id}
            className={`relative p-4 rounded-xl border transition-all ${
              pedidoNotificado === p.id
                ? "border-yellow-400 animate-pulse"
                : "border-zinc-800"
            }`}
          >
            {pedidoNotificado === p.id && (
              <span className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
                🔔 Atualizado
              </span>
            )}

            <div className="flex justify-between font-bold">
              <span className="capitalize">
                Status: {p.status.replace("_", " ")}
              </span>
              <span className="text-green-400">
                R$ {p.total.toFixed(2)}
              </span>
            </div>

            <div className="mt-2 text-sm space-y-1">
              {p.itens.map((i) => (
                <div
                  key={i.id}
                  className="flex justify-between text-zinc-300"
                >
                  <span>
                    {i.quantidade}x {i.nome}
                  </span>
                  <span>
                    R$ {(i.preco * i.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
