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
  itens: {
    id: string;
    nome: string;
    quantidade: number;
    preco: number;
  }[];
  createdAt: Timestamp;
};

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
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarPedidos();
  }, [cliente?.telefone]);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-red-400">
        📦 Status do seu pedido
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
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            {/* STATUS */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-400">
                Pedido #{pedido.id.slice(0, 6)}
              </span>

              <span
                className={`text-sm font-bold capitalize ${
                  pedido.status === "novo"
                    ? "text-yellow-400"
                    : pedido.status === "preparando"
                    ? "text-blue-400"
                    : "text-green-400"
                }`}
              >
                {pedido.status}
              </span>
            </div>

            {/* ITENS */}
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

            {/* TOTAL */}
            <div className="mt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {pedido.total.toFixed(2)}</span>
            </div>

            {/* PAGAMENTO */}
            <div className="text-xs text-zinc-400 mt-1">
              Pagamento: {pedido.pagamento}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
