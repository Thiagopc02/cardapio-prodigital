"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";

/* ================= TIPOS ================= */

type ItemPedido = {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
};

type PedidoStatus = "novo" | "preparando" | "em_rota" | "finalizado";

type Pedido = {
  pedidoId: string;
  status: PedidoStatus;
  total: number;
  itens: ItemPedido[];
};

/* ================= COMPONENT ================= */

export default function StatusClient() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("id");

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pedidoId) return;

    const q = query(
      collection(db, "pedidos"),
      where("pedidoId", "==", pedidoId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPedido(snapshot.docs[0].data() as Pedido);
      } else {
        setPedido(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pedidoId]);

  /* ================= UI ================= */

  if (!pedidoId) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4">
        Pedido inválido.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4">
        Carregando pedido...
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4">
        Pedido não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        📦 Acompanhar pedido
      </h1>

      <p className="mb-3">
        Status atual:{" "}
        <strong className="capitalize">
          {pedido.status.replace("_", " ")}
        </strong>
      </p>

      <div className="border border-zinc-800 rounded-xl p-3 space-y-1">
        {pedido.itens.map((i) => (
          <div
            key={i.id}
            className="flex justify-between text-sm text-zinc-300"
          >
            <span>
              {i.quantidade}x {i.nome}
            </span>
            <span>
              R$ {(i.preco * i.quantidade).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="flex justify-between font-bold mt-3">
          <span>Total</span>
          <span className="text-green-400">
            R$ {pedido.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
