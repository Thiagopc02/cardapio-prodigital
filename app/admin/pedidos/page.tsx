"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";

/* ================= TIPOS ================= */

type PedidoStatus = "novo" | "preparando" | "em_rota" | "finalizado";

type Pedido = {
  id: string;
  status: PedidoStatus;
  total: number;
  pagamento: string;
  cliente: {
    nome: string;
    telefone: string;
  };
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
  };
  itens: {
    id: string;
    nome: string;
    quantidade: number;
    preco: number;
  }[];
};

/* ================= COMPONENTE ================= */

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= CARREGAR PEDIDOS ================= */
  async function carregarPedidos() {
    try {
      setLoading(true);

      const q = query(
        collection(db, "pedidos"),
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

  /* ================= ALTERAR STATUS ================= */
  async function alterarStatus(id: string, status: PedidoStatus) {
    await updateDoc(doc(db, "pedidos", id), { status });

    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }

  /* ================= EXCLUIR PEDIDO ================= */
  async function excluirPedido(id: string) {
    if (!confirm("Excluir pedido?")) return;

    await deleteDoc(doc(db, "pedidos", id));
    setPedidos((prev) => prev.filter((p) => p.id !== id));
  }

  /* ================= EFFECT ================= */
  useEffect(() => {
    carregarPedidos();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">🧾 Pedidos</h1>

      {loading && <p className="text-zinc-400">Carregando...</p>}

      {!loading && pedidos.length === 0 && (
        <p className="text-zinc-400">Nenhum pedido encontrado.</p>
      )}

      <div className="space-y-4">
        {pedidos.map((p) => (
          <div
            key={p.id}
            className="border border-zinc-800 bg-zinc-900 p-4 rounded-xl"
          >
            {/* CABEÇALHO */}
            <div className="flex justify-between font-bold">
              <span>👤 {p.cliente.nome}</span>
              <span className="text-green-400">
                R$ {p.total.toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-zinc-400">
              📞 {p.cliente.telefone}
            </p>

            <p className="text-sm text-zinc-400">
              📍 {p.endereco.rua}, {p.endereco.numero} – {p.endereco.bairro}
            </p>

            {/* STATUS */}
            <div className="mt-2 text-sm">
              Status:{" "}
              <span className="font-bold capitalize text-yellow-400">
                {p.status.replace("_", " ")}
              </span>
            </div>

            {/* AÇÕES */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {p.status === "novo" && (
                <button
                  onClick={() => alterarStatus(p.id, "preparando")}
                  className="bg-blue-500 text-black px-3 py-1 rounded text-xs font-bold"
                >
                  🍳 Preparar
                </button>
              )}

              {p.status === "preparando" && (
                <button
                  onClick={() => alterarStatus(p.id, "em_rota")}
                  className="bg-yellow-400 text-black px-3 py-1 rounded text-xs font-bold"
                >
                  🚚 Em rota
                </button>
              )}

              {p.status === "em_rota" && (
                <button
                  onClick={() => alterarStatus(p.id, "finalizado")}
                  className="bg-green-500 text-black px-3 py-1 rounded text-xs font-bold"
                >
                  ✅ Finalizar
                </button>
              )}

              <button
                onClick={() => excluirPedido(p.id)}
                className="ml-auto text-red-400 text-xs font-semibold"
              >
                🗑 Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
