"use client";

import Image from "next/image";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { useCliente } from "@/context/ClientContext";
import { useAddress, Endereco } from "@/context/AddressContext";

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
  const {
    enderecoSelecionado,
    adicionarEndereco,
    selecionarEndereco,
  } = useAddress();

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [formaPagamento] = useState<FormaPagamento>("pix");

  // dados do cliente
  const [nome, setNome] = useState(cliente?.nome || "");
  const [telefone, setTelefone] = useState(cliente?.telefone || "");

  // endereço
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  /* ================= DESCONTO ================= */
  const temDesconto =
    !!cliente &&
    typeof cliente.comprasComDesconto === "number" &&
    cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  /* ================= GUARD ================= */
  if (!cartOpen) return null;

  /* ================= SALVAR ENDEREÇO ================= */
  function salvarEndereco() {
    if (!nome || !telefone || !cep || !rua || !numero || !bairro) {
      alert("Preencha nome, telefone e endereço completo.");
      return;
    }

    const novoEndereco: Endereco = {
      id: `end_${Date.now()}`,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      uf,
      padrao: true,
    };

    adicionarEndereco(novoEndereco);
    selecionarEndereco(novoEndereco.id);

    // salva/atualiza cliente
    setCliente({
      id: cliente?.id || `cli_${Date.now()}`,
      nome,
      telefone,
      cadastrado: true,
      comprasComDesconto: cliente?.comprasComDesconto || 0,
    });
  }

  /* ================= FINALIZAR PEDIDO ================= */
  async function finalizarPedido() {
    if (!cliente) {
      alert("Informe seus dados.");
      return;
    }

    if (!enderecoSelecionado) {
      alert("Informe o endereço de entrega.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      await addDoc(collection(db, "pedidos"), {
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,
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

        {/* ITENS */}
        {carrinho.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 bg-zinc-800 p-3 rounded-xl mb-2"
          >
            <Image
              src={item.imagem}
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

        {/* ENDEREÇO */}
        <div className="mt-4">
          <p className="font-semibold mb-2">📍 Endereço de entrega</p>

          {!enderecoSelecionado ? (
            <div className="space-y-2">
              <input
                className="w-full bg-zinc-800 p-2 rounded"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <input
                className="w-full bg-zinc-800 p-2 rounded"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />

              <input
                className="w-full bg-zinc-800 p-2 rounded"
                placeholder="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />

              <input
                className="w-full bg-zinc-800 p-2 rounded"
                placeholder="Rua"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
              />

              <input
                className="w-full bg-zinc-800 p-2 rounded"
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />

              <input
                className="w-full bg-zinc-800 p-2 rounded"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />

              <button
                onClick={salvarEndereco}
                className="w-full bg-blue-500 text-black py-2 rounded font-bold"
              >
                Salvar endereço
              </button>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500 rounded-xl p-3">
              <p className="font-semibold">
                {enderecoSelecionado.rua}, {enderecoSelecionado.numero}
              </p>
              <p className="text-sm text-zinc-300">
                {enderecoSelecionado.bairro} – {enderecoSelecionado.cidade}/{enderecoSelecionado.uf}
              </p>
            </div>
          )}
        </div>

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

        {/* FINALIZAR */}
        <button
          disabled={loading || !enderecoSelecionado}
          onClick={finalizarPedido}
          className="w-full mt-4 bg-green-500 text-black py-3 rounded-xl font-bold disabled:opacity-50"
        >
          🚚 Finalizar pedido
        </button>
      </div>
    </div>
  );
}