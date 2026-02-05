"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { obterCliente } from "@/src/utils/clienteStorage";

/* ================= TIPOS ================= */

type Pedido = {
  id: string;
  status: "novo" | "preparando" | "finalizado";
  total: number;
  pagamento: string;
  createdAt?: Timestamp;
  itens: {
    id: string;
    nome: string;
    quantidade: number;
    preco: number;
  }[];
};

/* ================= STATUS CONFIG ================= */

function statusInfo(status: Pedido["status"]) {
  switch (status) {
    case "novo":
      return {
        cor: "border-yellow-400 text-yellow-400",
        label: "🕒 Pedido recebido",
      };
    case "preparando":
      return {
        cor: "border-blue-400 text-blue-400",
        label: "👨‍🍳 Em preparo",
      };
    case "finalizado":
      return {
        cor: "border-green-400 text-green-400",
        label: "✅ Finalizado",
      };
  }
}

/* ================= PAGE ================= */

export default function StatusPage() {
  const cliente = obterCliente();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPedidos() {
      if (!cliente?.telefone) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "pedidos"),
          where("cliente.telefone", "==", cliente.telefone),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const lista: Pedido[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Pedido, "id">),
        }));

        setPedidos(lista);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarPedidos();
  }, [cliente?.telefone]);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 max-w-md mx-auto">
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
        {pedidos.map((pedido) => {
          const status = statusInfo(pedido.status);

          return (
            <div
              key={pedido.id}
              className={`bg-zinc-950 border-l-4 ${status.cor} rounded-xl p-4`}
            >
              <div className={`font-bold mb-2 ${status.cor}`}>
                {status.label}
              </div>

              <div className="text-sm space-y-1">
                {pedido.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between"
                  >
                    <span>
                      {item.quantidade}x {item.nome}
                    </span>
                    <span>
                      R${" "}
                      {(item.preco * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>R$ {pedido.total.toFixed(2)}</span>
              </div>

              <div className="text-xs text-zinc-400 mt-1">
                Pagamento: {pedido.pagamento}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
