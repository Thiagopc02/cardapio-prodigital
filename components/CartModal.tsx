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

type StatusPedido =
  | "novo"
  | "preparando"
  | "em rota"
  | "finalizado";

type ItemPedido = {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
};

type Pedido = {
  id: string;
  status: StatusPedido;
  total: number;
  pagamento: string;
  itens: ItemPedido[];
  createdAt?: Timestamp;
};

export default function StatusPage() {
  const cliente = obterCliente();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const statusAnterior = useRef<Record<string, StatusPedido>>({});
  const [notificado, setNotificado] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!cliente?.telefone) return;

    const q = query(
      collection(db, "pedidos"),
      where("cliente.telefone", "==", cliente.telefone),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Pedido[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Pedido, "id">),
      }));

      lista.forEach((p) => {
        if (
          statusAnterior.current[p.id] &&
          statusAnterior.current[p.id] !== p.status
        ) {
          setNotificado(p.id);
          setTimeout(() => setNotificado(null), 4000);
        }
        statusAnterior.current[p.id] = p.status;
      });

      setPedidos(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cliente?.telefone]);

  if (!cliente?.telefone) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4">
        Nenhum cliente identificado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        📦 Acompanhar pedidos
      </h1>

      {loading && <p>Carregando...</p>}

      {!loading && pedidos.length === 0 && (
        <p>Nenhum pedido encontrado.</p>
      )}

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className={`border rounded-xl p-4 ${
              notificado === pedido.id
                ? "border-yellow-400 animate-pulse"
                : "border-zinc-800"
            }`}
          >
            <div className="flex justify-between font-bold">
              <span>{pedido.status}</span>
              <span className="text-green-400">
                R$ {pedido.total.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
