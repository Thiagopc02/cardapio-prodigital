"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
    enderecos,
    enderecoSelecionado,
    selecionarEndereco,
    adicionarEndereco,
  } = useAddress();

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [formaPagamento] = useState<FormaPagamento>("pix");

  const [novoEndereco, setNovoEndereco] = useState<Omit<Endereco, "id">>({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
    cidade: "",
    uf: "",
    padrao: true,
  });

  /* ================= BUSCA CEP ================= */
  useEffect(() => {
    const cepLimpo = novoEndereco.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
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

  /* ================= DESCONTO ================= */
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

      setCliente({
        ...cliente,
        telefone: telefoneCliente,
        comprasComDesconto:
          typeof cliente.comprasComDesconto === "number"
            ? cliente.comprasComDesconto + 1
            : 1,
      });

      const docRef = await addDoc(collection(db, "pedidos"), {
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

      // 👉 Redireciona para acompanhamento do pedido
      window.location.href = `/status?id=${docRef.id}`;
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

        {/* ENDEREÇO */}
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">📍 Endereço de entrega</h3>

          {enderecos.length > 0 ? (
            enderecos.map((e) => (
              <button
                key={e.id}
                onClick={() => selecionarEndereco(e.id)}
                className={`w-full text-left p-3 rounded-xl border ${
                  e.padrao
                    ? "border-green-500 bg-green-500/10"
                    : "border-zinc-700 bg-zinc-800"
                }`}
              >
                <p className="text-sm font-semibold">
                  {e.rua}, {e.numero}
                </p>
                <p className="text-xs text-zinc-400">
                  {e.bairro} – {e.cidade}/{e.uf}
                </p>
              </button>
            ))
          ) : (
            <div className="space-y-2">
              <input
                placeholder="CEP"
                className="w-full p-2 rounded bg-zinc-800"
                value={novoEndereco.cep}
                onChange={(e) =>
                  setNovoEndereco({ ...novoEndereco, cep: e.target.value })
                }
              />
              <input
                placeholder="Rua"
                className="w-full p-2 rounded bg-zinc-800"
                value={novoEndereco.rua}
                onChange={(e) =>
                  setNovoEndereco({ ...novoEndereco, rua: e.target.value })
                }
              />
              <input
                placeholder="Número"
                className="w-full p-2 rounded bg-zinc-800"
                value={novoEndereco.numero}
                onChange={(e) =>
                  setNovoEndereco({ ...novoEndereco, numero: e.target.value })
                }
              />
              <input
                placeholder="Bairro"
                className="w-full p-2 rounded bg-zinc-800"
                value={novoEndereco.bairro}
                onChange={(e) =>
                  setNovoEndereco({ ...novoEndereco, bairro: e.target.value })
                }
              />

              <button
                onClick={() =>
                  adicionarEndereco({
                    ...novoEndereco,
                    id: crypto.randomUUID(),
                  })
                }
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

        {!cliente ? (
          <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl text-sm">
            ⚠️ Identifique-se para finalizar o pedido.
          </div>
        ) : (
          <button
            disabled={!enderecoSelecionado || loading}
            onClick={finalizarPedido}
            className="w-full mt-4 bg-green-500 text-black py-3 rounded-xl font-bold disabled:opacity-40"
          >
            🚚 Finalizar pedido
          </button>
        )}
      </div>
    </div>
  );
}