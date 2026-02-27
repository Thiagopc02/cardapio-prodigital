"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";

/* ================= TIPOS ================= */

type PedidoStatus = "novo" | "preparando" | "em_rota" | "finalizado";

type ItemPedido = {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
};

type Pedido = {
  status: PedidoStatus;
  total: number;
  itens: ItemPedido[];
};

/* ================= COMPONENT ================= */

export default function StatusClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("id");

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= REALTIME LISTENER ================= */
  useEffect(() => {
    if (!pedidoId) return;

    const ref = doc(db, "pedidos", pedidoId);

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setPedido(snap.data() as Pedido);
        } else {
          setPedido(null);
        }
        setLoading(false);
      },
      () => {
        setPedido(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [pedidoId]);

  /* ================= UI STATES ================= */

  if (!pedidoId) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <p>Pedido inválido.</p>
        <button
          onClick={() => router.push("/")}
          className="text-green-400 font-semibold"
        >
          ← Voltar para o cardápio
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Carregando pedido...
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <p>Pedido não encontrado.</p>
        <button
          onClick={() => router.push("/")}
          className="text-green-400 font-semibold"
        >
          ← Voltar para o cardápio
        </button>
      </div>
    );
  }

  /* ================= STATUS LABEL ================= */

  const statusLabel: Record<PedidoStatus, string> = {
    novo: "Pedido recebido",
    preparando: "Preparando pedido",
    em_rota: "Saiu para entrega",
    finalizado: "Pedido finalizado",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 max-w-md mx-auto space-y-4">
      {/* VOLTAR */}
      <button
        onClick={() => router.push("/")}
        className="text-green-400 font-semibold"
      >
        ← Voltar para o cardápio
      </button>

      <h1 className="text-xl font-bold">📦 Acompanhar pedido</h1>

      <p className="text-sm text-zinc-400">
        Pedido ID: <span className="break-all">{pedidoId}</span>
      </p>

      {/* STATUS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="font-semibold mb-2">Status atual</p>
        <p className="text-green-400 font-bold">
          {statusLabel[pedido.status]}
        </p>
      </div>

      {/* ITENS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
        {pedido.itens.map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-sm text-zinc-300"
          >
            <span>
              {item.quantidade}x {item.nome}
            </span>
            <span>
              R$ {(item.preco * item.quantidade).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="border-t border-zinc-700 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-green-400">
            R$ {pedido.total.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-500 text-center">
        Esta página é atualizada automaticamente conforme o pedido avança.
      </p>
    </div>
  );
}