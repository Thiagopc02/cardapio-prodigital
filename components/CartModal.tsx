"use client";

import Image from "next/image";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { useCliente } from "@/context/ClientContext";
import { useAddress, Endereco } from "@/context/AddressContext";

/* ================= TIPOS ================= */

type FormaPagamento = "pix";

/* ================= COMPONENTE ================= */

export default function CartModal() {
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
  } = useAddress();

  /* ================= STATE ================= */

  const [loading, setLoading] = useState(false);
  const [mostrarFormularioEndereco, setMostrarFormularioEndereco] =
    useState(!enderecoSelecionado);

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  const formaPagamento: FormaPagamento = "pix";

  /* ================= REGRAS ================= */

  const temDesconto =
    !!cliente &&
    typeof cliente.comprasComDesconto === "number" &&
    cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  if (!cartOpen) return null;

  /* ================= ENDEREÇO ================= */

  function salvarEndereco() {
    if (!cep || !rua || !numero || !bairro || !cidade || !uf) {
      alert("Preencha todos os campos do endereço.");
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
    setMostrarFormularioEndereco(false);
  }

  /* ================= FINALIZAR ================= */

  async function finalizarPedido() {
    if (!cliente) {
      alert("Identifique-se para finalizar o pedido.");
      return;
    }

    if (!enderecoSelecionado) {
      alert("Selecione ou cadastre um endereço.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const telefoneCliente = cliente.telefone.startsWith("+")
        ? cliente.telefone
        : `+55${cliente.telefone.replace(/\D/g, "")}`;

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
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar pedido.");
    } finally {
      setLoading(false);
    }
  }

  /* ================= RENDER ================= */

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
              src={item.imagem || "/placeholder.png"}
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

          {!mostrarFormularioEndereco && enderecoSelecionado && (
            <div className="bg-green-900/30 border border-green-500 rounded-xl p-3">
              <p className="font-semibold">
                {enderecoSelecionado.rua}, {enderecoSelecionado.numero}
              </p>
              <p className="text-sm text-zinc-300">
                {enderecoSelecionado.bairro} –{" "}
                {enderecoSelecionado.cidade}/{enderecoSelecionado.uf}
              </p>

              <button
                onClick={() => setMostrarFormularioEndereco(true)}
                className="mt-2 text-sm text-green-400 underline"
              >
                ➕ Adicionar novo endereço
              </button>
            </div>
          )}

          {mostrarFormularioEndereco && (
            <div className="space-y-2">
              <input
                placeholder="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800"
              />
              <input
                placeholder="Rua"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800"
              />
              <input
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800"
              />
              <input
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800"
              />
              <input
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800"
              />
              <input
                placeholder="UF"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800"
              />

              <button
                onClick={salvarEndereco}
                className="w-full bg-blue-500 text-black py-2 rounded-xl font-bold"
              >
                Salvar endereço
              </button>
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

        <button
          disabled={loading}
          onClick={finalizarPedido}
          className="w-full mt-4 bg-green-500 text-black py-3 rounded-xl font-bold disabled:opacity-60"
        >
          🚚 Finalizar pedido
        </button>
      </div>
    </div>
  );
}