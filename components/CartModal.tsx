"use client";

import Image from "next/image";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { useCliente } from "@/context/ClientContext";
import { useAddress } from "@/context/AddressContext";

/* ================= TIPOS ================= */

type FormaPagamento = "dinheiro" | "pix" | "cartao";

/* ================= COMPONENTE ================= */

export default function CartModal() {
  /* ================= CONTEXTOS ================= */
  const {
    carrinho,
    total,
    cartOpen,
    setCartOpen,
    limparCarrinho,
  } = useCart();

  const { cliente, setCliente } = useCliente();
  const { enderecoSelecionado } = useAddress();

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [formaPagamento] = useState<FormaPagamento>("pix");

  /* ================= REGRAS ================= */
  const temDesconto =
    !!cliente &&
    typeof cliente.comprasComDesconto === "number" &&
    cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  /* ================= GUARD ================= */
  if (!cartOpen) return null;

  /* ================= FINALIZAR ================= */
  async function finalizarPedido() {
    if (!cliente) {
      alert("Identifique-se para finalizar o pedido.");
      return;
    }

    if (!enderecoSelecionado) {
      alert("Selecione um endereço para entrega.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const telefoneCliente = cliente.telefone.startsWith("+")
        ? cliente.telefone
        : `+55${cliente.telefone.replace(/\D/g, "")}`;

      // Atualiza cliente SEM função (evita erro de tipagem)
      setCliente({
        ...cliente,
        telefone: telefoneCliente,
        comprasComDesconto:
          typeof cliente.comprasComDesconto === "number"
            ? cliente.comprasComDesconto + 1
            : 1,
      });

      await addDoc(collection(db, "pedidos"), {
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          telefone: telefoneCliente,
        },
        endereco: enderecoSelecionado,
        itens: carrinho.map((item) => ({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.qtd,
        })),
        total: totalFinal,
        pagamento: { tipo: formaPagamento },
        status: "novo",
        createdAt: serverTimestamp(),
      });

      limparCarrinho();
      setCartOpen(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao finalizar pedido.");
    } finally {
      setLoading(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setCartOpen(false)}
      />

      {/* MODAL */}
      <div className="relative bg-zinc-900 w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-3">🛒 Seu carrinho</h2>

        {carrinho.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 bg-zinc-800 p-3 rounded-xl mb-2"
          >
            <Image
              src={
                item.imagem && item.imagem.startsWith("/")
                  ? item.imagem
                  : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='100%' height='100%' fill='%23333333'/><text x='50%' y='50%' fill='%23999999' font-size='10' text-anchor='middle' dominant-baseline='middle'>SEM IMAGEM</text></svg>"
              }
              alt={item.nome}
              width={60}
              height={60}
              className="rounded-lg"
              unoptimized
            />

            <div>
              <p className="font-semibold">{item.nome}</p>
              <p className="text-sm text-zinc-400">
                {item.qtd}x • R$ {(item.preco * item.qtd).toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        {/* TOTAL */}
        <div className="mt-4 bg-zinc-800 p-3 rounded-xl">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Subtotal</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>

          {temDesconto && (
            <div className="flex justify-between text-sm text-green-400">
              <span>Desconto</span>
              <span>-5%</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total</span>
            <span>R$ {totalFinal.toFixed(2)}</span>
          </div>
        </div>

        {!cliente ? (
          <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl text-sm">
            ⚠️ Identifique-se para finalizar o pedido.
          </div>
        ) : (
          <button
            disabled={loading}
            onClick={finalizarPedido}
            className="w-full mt-4 bg-green-500 text-black py-3 rounded-xl font-bold disabled:opacity-60"
          >
            🚚 Finalizar pedido
          </button>
        )}
      </div>
    </div>
  );
}