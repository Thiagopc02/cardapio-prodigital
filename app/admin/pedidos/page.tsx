"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Pedido } from "@/src/types/Pedidos";

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     CARREGAR PEDIDOS
  ========================= */
  async function carregarPedidos() {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, "pedidos"));

      const lista: Pedido[] = snap.docs.map((d) => ({
        id: d.id, // 🔥 garantido
        ...(d.data() as Omit<Pedido, "id">),
      }));

      setPedidos(lista);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     ALTERAR STATUS
  ========================= */
  async function alterarStatus(
    pedidoId: string,
    status: Pedido["status"]
  ) {
    await updateDoc(doc(db, "pedidos", pedidoId), { status });

    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoId ? { ...p, status } : p
      )
    );
  }

  /* =========================
     EXCLUIR PEDIDO
  ========================= */
  async function excluirPedido(pedidoId: string) {
    if (!confirm("Deseja realmente excluir este pedido?")) return;

    await deleteDoc(doc(db, "pedidos", pedidoId));
    setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <h1 className="text-xl font-bold mb-4">Pedidos</h1>

      {loading && (
        <p className="text-zinc-400">Carregando pedidos...</p>
      )}

      {!loading && pedidos.length === 0 && (
        <p className="text-zinc-400">Nenhum pedido encontrado.</p>
      )}

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
          >
            {/* CABEÇALHO */}
            <div className="flex justify-between font-semibold">
              <span>{pedido.cliente.nome}</span>
              <span>R$ {pedido.total.toFixed(2)}</span>
            </div>

            {/* CLIENTE */}
            <div className="text-sm text-zinc-400 mt-1">
              📞 {pedido.cliente.telefone}
              <br />
              ✉️ {pedido.cliente.email}
            </div>

            {/* ENDEREÇO */}
            <div className="text-sm text-zinc-400 mt-2">
              📍 {pedido.endereco.rua}, {pedido.endereco.numero} –{" "}
              {pedido.endereco.bairro}
              {pedido.endereco.complemento &&
                ` (${pedido.endereco.complemento})`}
            </div>

            {/* ITENS */}
            <div className="mt-3 space-y-1 text-sm">
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

            {/* STATUS */}
            <div className="text-xs text-zinc-400 mt-2">
              Status:{" "}
              <span className="text-green-400 capitalize">
                {pedido.status}
              </span>
            </div>

            {/* AÇÕES */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {pedido.status === "novo" && (
                <button
                  onClick={() =>
                    alterarStatus(pedido.id, "preparando")
                  }
                  className="bg-blue-500 text-black px-3 py-1 rounded text-xs font-bold"
                >
                  Preparar
                </button>
              )}

              {pedido.status === "preparando" && (
                <button
                  onClick={() =>
                    alterarStatus(pedido.id, "finalizado")
                  }
                  className="bg-green-500 text-black px-3 py-1 rounded text-xs font-bold"
                >
                  Finalizar
                </button>
              )}

              <button
                onClick={() => excluirPedido(pedido.id)}
                className="ml-auto text-red-400 text-xs font-semibold"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
