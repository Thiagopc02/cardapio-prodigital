"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { obterCliente } from "@/src/utils/clienteStorage";

/* ================= TIPOS ================= */

type ItemPedido = {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
};

type Pedido = {
  id: string;
  status: "novo" | "preparando" | "finalizado";
  total: number;
  pagamento: string;
  itens: ItemPedido[];
  createdAt?: Timestamp;
};

/* ================= COMPONENTE ================= */

export default function StatusPage() {
  const cliente = obterCliente();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👉 NÃO faz nada se não houver telefone
    if (!cliente?.telefone) return;

    const telefoneNormalizado = cliente.telefone.replace(/\D/g, "");

    const q = query(
      collection(db, "pedidos"),
      where("cliente.telefone", "==", telefoneNormalizado),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Pedido, "id">),
      }));

      setPedidos(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cliente?.telefone]);

  /* ================= HELPERS ================= */

  function statusColor(status: Pedido["status"]) {
    if (status === "novo") return "text-yellow-400";
    if (status === "preparando") return "text-blue-400";
    return "text-green-400";
  }

  function statusEmoji(status: Pedido["status"]) {
    if (status === "novo") return "🆕";
    if (status === "preparando") return "🍳";
    return "✅";
  }

  /* ================= UI ================= */

  // 🔴 CLIENTE NÃO IDENTIFICADO
  if (!cliente?.telefone) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2">📦 Acompanhar pedidos</h1>
        <p className="text-zinc-400">
          Nenhum cliente identificado neste dispositivo.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">📦 Acompanhar pedidos</h1>

      {loading && (
        <p className="text-zinc-400">Carregando pedidos...</p>
      )}

      {!loading && pedidos.length === 0 && (
        <p className="text-zinc-400">
          Nenhum pedido encontrado.
        </p>
      )}

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex justify-between items-center font-bold mb-2">
              <span
                className={`flex items-center gap-1 ${statusColor(
                  pedido.status
                )}`}
              >
                {statusEmoji(pedido.status)} {pedido.status}
              </span>

              <span className="text-green-400">
                R$ {pedido.total.toFixed(2)}
              </span>
            </div>

            <div className="text-sm space-y-1">
              {pedido.itens.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-zinc-300"
                >
                  <span>
                    {item.quantidade}x {item.nome}
                  </span>
                  <span>
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xs text-zinc-400 mt-2">
              💳 Pagamento: {pedido.pagamento}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
