"use client";

import Image from "next/image";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { useCliente } from "@/context/ClientContext";
import { useAddress } from "@/context/AddressContext";

/* ================= TIPOS ================= */

type FormaPagamento = "pix" | "dinheiro" | "cartao";

/* ================= COMPONENTE ================= */

export default function CartModal() {
  const { carrinho, total, cartOpen, setCartOpen, limparCarrinho } = useCart();
  const { cliente, setCliente } = useCliente();
  const {
    enderecoSelecionado,
    adicionarEndereco,
  } = useAddress();

  /* ================= STATE ================= */

  const [loading, setLoading] = useState(false);
  const [mostrarFormEndereco, setMostrarFormEndereco] = useState(false);

  // Cliente
  const [nome, setNome] = useState(cliente?.nome || "");
  const [telefone, setTelefone] = useState(cliente?.telefone || "");

  // Endereço
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  const temDesconto =
    !!cliente &&
    typeof cliente.comprasComDesconto === "number" &&
    cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  if (!cartOpen) return null;

  /* ================= SALVAR ENDEREÇO ================= */

  function salvarEndereco() {
    if (!cep || !rua || !numero || !bairro || !cidade || !uf) {
      alert("Preencha todos os campos do endereço.");
      return;
    }

    adicionarEndereco({
      id: crypto.randomUUID(),
      cep,
      rua,
      numero,
      bairro,
      cidade,
      uf,
      padrao: true,
    });

    setMostrarFormEndereco(false);
  }

  /* ================= FINALIZAR PEDIDO ================= */

  async function finalizarPedido() {
    if (!nome.trim() || !telefone.trim()) {
      alert("Informe nome completo e celular.");
      return;
    }

    if (!enderecoSelecionado) {
      alert("Selecione um endereço.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const telefoneFormatado = telefone.startsWith("+")
        ? telefone
        : `+55${telefone.replace(/\D/g, "")}`;

      setCliente({
        id: cliente?.id || crypto.randomUUID(),
        nome,
        telefone: telefoneFormatado,
        cadastrado: true,
        comprasComDesconto:
          typeof cliente?.comprasComDesconto === "number"
            ? cliente.comprasComDesconto + 1
            : 1,
      });

      await addDoc(collection(db, "pedidos"), {
        cliente: {
          nome,
          telefone: telefoneFormatado,
        },
        endereco: enderecoSelecionado,
        itens: carrinho.map((item) => ({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.qtd,
        })),
        total: totalFinal,
        pagamento: { tipo: "pix" },
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

      <div className="relative bg-zinc-900 w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="font-bold text-lg">🛒 Seu carrinho</h2>

        {carrinho.map((item) => (
          <div key={item.id} className="flex gap-3 bg-zinc-800 p-3 rounded-xl">
            <Image
              src={item.imagem || ""}
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

        {/* CLIENTE */}
        <div className="bg-zinc-800 p-3 rounded-xl space-y-2">
          <input
            className="w-full bg-zinc-900 p-2 rounded"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className="w-full bg-zinc-900 p-2 rounded"
            placeholder="Celular"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        {/* ENDEREÇO */}
        {enderecoSelecionado && !mostrarFormEndereco && (
          <div className="bg-green-500/10 border border-green-500 rounded-xl p-3">
            <p className="font-semibold">
              {enderecoSelecionado.rua}, {enderecoSelecionado.numero}
            </p>
            <p className="text-sm text-zinc-300">
              {enderecoSelecionado.bairro} – {enderecoSelecionado.cidade}/{enderecoSelecionado.uf}
            </p>

            <button
              onClick={() => setMostrarFormEndereco(true)}
              className="mt-2 text-sm text-green-400 font-semibold"
            >
              ➕ Adicionar novo endereço
            </button>
          </div>
        )}

        {mostrarFormEndereco && (
          <div className="bg-zinc-800 p-3 rounded-xl space-y-2">
            <input className="input" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
            <input className="input" placeholder="Rua" value={rua} onChange={(e) => setRua(e.target.value)} />
            <input className="input" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
            <input className="input" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
            <input className="input" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
            <input className="input" placeholder="UF" value={uf} onChange={(e) => setUf(e.target.value)} />

            <button
              onClick={salvarEndereco}
              className="w-full bg-blue-500 text-black py-2 rounded-xl font-bold"
            >
              Salvar endereço
            </button>

            {enderecoSelecionado && (
              <button
                onClick={() => setMostrarFormEndereco(false)}
                className="w-full text-sm text-zinc-400"
              >
                Usar endereço já salvo
              </button>
            )}
          </div>
        )}

        {/* TOTAL */}
        <div className="bg-zinc-800 p-3 rounded-xl">
          <div className="flex justify-between text-sm">
            <span>Total</span>
            <span className="font-bold text-green-400">
              R$ {totalFinal.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={finalizarPedido}
          disabled={loading}
          className="w-full bg-green-500 text-black py-3 rounded-xl font-bold"
        >
          🚚 Finalizar pedido
        </button>
      </div>
    </div>
  );
}