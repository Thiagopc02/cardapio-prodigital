"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
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
  id: string;
  status: PedidoStatus;
  total: number;
  itens: ItemPedido[];
  createdAt?: Timestamp;
};

/* ================= COMPONENT ================= */

export default function StatusClient() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= IDENTIFICAR CLIENTE ================= */

  const telefone =
    typeof window !== "undefined"
      ? localStorage.getItem("telefoneCliente")
      : null;

  /* ================= LISTENER ================= */

  useEffect(() => {
    // 🔹 Se não tem telefone, não escuta nada
    if (!telefone) return;

    const q = query(
      collection(db, "pedidos"),
      where("clienteId", "==", telefone),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const lista: Pedido[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Pedido, "id">),
        }));

        setPedidos(lista);
        setLoading(false); // ✅ permitido (callback externo)
      },
      () => {
        setPedidos([]);
        setLoading(false); // ✅ permitido
      }
    );

    return () => unsubscribe();
  }, [telefone]);

  /* ================= UI STATES ================= */

  if (!telefone) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <p>Nenhum pedido encontrado.</p>
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
        Carregando pedidos...
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <p>Nenhum pedido encontrado.</p>
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
      <button
        onClick={() => router.push("/")}
        className="text-green-400 font-semibold"
      >
        ← Voltar para o cardápio
      </button>

      <h1 className="text-xl font-bold">📦 Meus pedidos</h1>

      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2"
        >
          <p className="text-xs text-zinc-400 break-all">
            Pedido ID: {pedido.id}
          </p>

          <p className="font-semibold text-green-400">
            {statusLabel[pedido.status]}
          </p>

          <div className="text-sm text-zinc-300 space-y-1">
            {pedido.itens.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.quantidade}x {item.nome}
                </span>
                <span>
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-700 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-green-400">
              R$ {pedido.total.toFixed(2)}
            </span>
          </div>
        </div>
      ))}

      <p className="text-xs text-zinc-500 text-center">
        Os pedidos são atualizados automaticamente em tempo real.
      </p>
    </div>
  );
}