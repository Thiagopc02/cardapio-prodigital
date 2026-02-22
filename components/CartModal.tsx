"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { useCliente } from "@/context/ClientContext";
import { useAddress } from "@/context/AddressContext";

/* ================= TIPOS ================= */

type FormaPagamento = "dinheiro" | "pix" | "cartao";

/* ================= COMPONENTE ================= */

export default function CartModal() {
  const { carrinho, total, setCartOpen, limparCarrinho } = useCart();
  const { cliente, setCliente } = useCliente();
  const {
    enderecos,
    enderecoSelecionado,
    selecionarEndereco,
  } = useAddress();

  const [loading, setLoading] = useState(false);
  const [formaPagamento] = useState<FormaPagamento>("pix");

  const [novoEndereco, setNovoEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
    cidade: "",
    uf: "",
  });

  useEffect(() => {
    if (novoEndereco.cep.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${novoEndereco.cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.erro) {
          setNovoEndereco((prev) => ({
            ...prev,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            uf: data.uf || "",
          }));
        }
      });
  }, [novoEndereco.cep]);

  const temDesconto =
    cliente?.cadastrado && cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  async function finalizarPedido() {
    if (!cliente || !enderecoSelecionado || loading) {
      alert("Selecione um endereço para entrega.");
      return;
    }

    try {
      setLoading(true);

      const telefoneCliente = cliente.telefone.startsWith("+")
        ? cliente.telefone
        : `+55${cliente.telefone.replace(/\D/g, "")}`;

      setCliente({
        ...cliente,
        telefone: telefoneCliente,
        comprasComDesconto: cliente.comprasComDesconto + 1,
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setCartOpen(false)}
      />

      <div className="relative bg-zinc-900 w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-3">🛒 Seu carrinho</h2>

        {carrinho.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 bg-zinc-800 p-3 rounded-xl mb-2"
          >
            <Image
              src={item.imagem || "/produtos/placeholder.png"}
              alt={item.nome}
              width={60}
              height={60}
              className="rounded-lg"
            />
            <div>
              <p className="font-semibold">{item.nome}</p>
              <p className="text-sm text-zinc-400">
                {item.qtd}x • R$ {(item.preco * item.qtd).toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        <div className="mt-4">
          <p className="font-semibold mb-2">📍 Endereço de entrega</p>

          {enderecos.map((end) => (
            <button
              key={end.id}
              onClick={() => selecionarEndereco(end.id)}
              className={`w-full text-left p-3 mb-2 rounded-xl border ${
                enderecoSelecionado?.id === end.id
                  ? "border-green-500 bg-green-500/10"
                  : "border-zinc-700 bg-zinc-800"
              }`}
            >
              <p className="text-sm">
                {end.rua}, Nº {end.numero}
              </p>
              <p className="text-xs text-zinc-400">
                {end.bairro} - {end.cidade}/{end.uf}
              </p>
            </button>
          ))}
        </div>

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
            className="w-full mt-4 bg-green-500 text-black py-3 rounded-xl font-bold"
          >
            🚚 Finalizar pedido
          </button>
        )}
      </div>
    </div>
  );
}