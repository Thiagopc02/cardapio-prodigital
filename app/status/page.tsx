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
import { obterCliente } from "@/src/utils/clienteStorage";

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
  pagamento: string;
  itens: ItemPedido[];
  createdAt?: Timestamp;
};

/* ================= COMPONENTE ================= */

export default function StatusPage() {
  const cliente = obterCliente();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoNotificado, setPedidoNotificado] = useState<string | null>(null);

  // guarda status anterior para detectar mudança
  const statusAnterior = useRef<Record<string, PedidoStatus>>({});

  useEffect(() => {
    // 👉 SEM cliente, NÃO FAZ NADA (sem setState)
    if (!cliente?.telefone) return;

    const telefoneNormalizado = cliente.telefone.replace(/\D/g, "");

    const q = query(
      collection(db, "pedidos"),
      where("cliente.telefone", "==", telefoneNormalizado),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Pedido[] = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Pedido, "id">;

        const statusAnt = statusAnterior.current[doc.id];

        // 🔔 detecta mudança de status
        if (statusAnt && statusAnt !== data.status) {
          setPedidoNotificado(doc.id);
          setTimeout(() => setPedidoNotificado(null), 4000);
        }

        statusAnterior.current[doc.id] = data.status;

        return { id: doc.id, ...data };
      });

      setPedidos(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cliente?.telefone]);

  /* ================= UI ================= */

  // 👉 CLIENTE NÃO IDENTIFICADO
  if (!cliente?.telefone) {
    return (
      <div className="p-4 text-white max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2">📦 Acompanhar pedidos</h1>
        <p className="text-zinc-400">
          Nenhum cliente identificado neste dispositivo.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 text-white max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">📦 Acompanhar pedidos</h1>

      {loading && (
        <p className="text-zinc-400">Carregando pedidos...</p>
      )}

      {!loading && pedidos.length === 0 && (
        <p className="text-zinc-400">Nenhum pedido encontrado.</p>
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
                <div key={i.id} className="flex justify-between">
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
