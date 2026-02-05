"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Pedido } from "@/src/types/Pedidos";

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarPedidos() {
    try {
      setLoading(true);

      const q = query(
        collection(db, "pedidos"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const lista: Pedido[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Pedido, "id">),
      }));

      setPedidos(lista);
    } catch (err) {
      console.error("Erro ao carregar pedidos", err);
    } finally {
      setLoading(false);
    }
  }

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

  async function excluirPedido(pedidoId: string) {
    if (!confirm("Excluir este pedido?")) return;
    await deleteDoc(doc(db, "pedidos", pedidoId));
    setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">🧾 Pedidos</h1>

      {loading && <p className="text-zinc-400">Carregando...</p>}

      {!loading && pedidos.length === 0 && (
        <p className="text-zinc-400">Nenhum pedido encontrado.</p>
      )}

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
          >
            <div className="flex justify-between font-semibold">
              <span>{pedido.cliente.nome}</span>
              <span>R$ {pedido.total.toFixed(2)}</span>
            </div>

            <p className="text-sm text-zinc-400 mt-1">
              📞 {pedido.cliente.telefone}
            </p>

            <p className="text-sm text-zinc-400 mt-1">
              📍 {pedido.endereco.rua}, {pedido.endereco.numero} –{" "}
              {pedido.endereco.bairro}
            </p>

            <div className="mt-3 text-sm space-y-1">
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

            <div className="mt-2 text-xs">
              Status:{" "}
              <span className="text-green-400 capitalize">
                {pedido.status}
              </span>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              {pedido.status === "novo" && (
                <button
                  onClick={() =>
                    alterarStatus(pedido.id, "preparando")
                  }
                  className="bg-blue-500 px-3 py-1 rounded text-black text-xs font-bold"
                >
                  Preparar
                </button>
              )}

              {pedido.status === "preparando" && (
                <button
                  onClick={() =>
                    alterarStatus(pedido.id, "finalizado")
                  }
                  className="bg-green-500 px-3 py-1 rounded text-black text-xs font-bold"
                >
                  Finalizar
                </button>
              )}

              <button
                onClick={() => excluirPedido(pedido.id)}
                className="ml-auto text-red-400 text-xs"
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
