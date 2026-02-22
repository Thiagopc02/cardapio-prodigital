"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { useCliente } from "@/context/ClientContext";

/* ================= TIPOS ================= */

type Endereco = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  uf: string;
};

type FormaPagamento = "dinheiro" | "pix" | "cartao";

/* ================= COMPONENTE ================= */

export default function CartModal() {
  // ✅ TODOS OS HOOKS NO TOPO (sem exceção)
  const { carrinho, total, cartOpen, setCartOpen, limparCarrinho } = useCart();
  const { cliente, setCliente } = useCliente();

  const [loading, setLoading] = useState(false);
  const [formaPagamento] = useState<FormaPagamento>("pix");

  const [endereco, setEndereco] = useState<Endereco>({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
    cidade: "",
    uf: "",
  });

  /* ================= BUSCAR CEP ================= */

  useEffect(() => {
    if (endereco.cep.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${endereco.cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.erro) {
          setEndereco((prev) => ({
            ...prev,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            uf: data.uf || "",
          }));
        }
      })
      .catch(() => {});
  }, [endereco.cep]);

  /* ================= EARLY RETURN (APÓS HOOKS) ================= */

  if (!cartOpen) return null;

  /* ================= DESCONTO ================= */

  const temDesconto =
    !!cliente && cliente.cadastrado && cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  /* ================= VALIDAR ================= */

  function validarPedido() {
    if (!cliente) return false;

    if (
      !endereco.cep ||
      !endereco.rua ||
      !endereco.numero ||
      !endereco.bairro
    ) {
      alert("Preencha todos os dados do endereço.");
      return false;
    }

    return true;
  }

  /* ================= FINALIZAR PEDIDO ================= */

  async function enviarPedidoWhatsApp() {
    if (loading || !cliente) return;
    if (!validarPedido()) return;

    try {
      setLoading(true);

      const pedidoId = crypto.randomUUID();

      const telefoneCliente = cliente.telefone.startsWith("+")
        ? cliente.telefone
        : `+55${cliente.telefone.replace(/\D/g, "")}`;

      // 🔄 Atualiza cliente no contexto
      setCliente({
        ...cliente,
        telefone: telefoneCliente,
        comprasComDesconto: cliente.comprasComDesconto + 1,
      });

      await addDoc(collection(db, "pedidos"), {
        pedidoId,
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          telefone: telefoneCliente,
        },
        endereco,
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

      const itensTexto = carrinho
        .map(
          (i) =>
            `• ${i.qtd}x ${i.nome} — R$ ${(i.preco * i.qtd).toFixed(2)}`
        )
        .join("\n");

      const urlStatus = `https://cardapio-prodigital.vercel.app/status?id=${pedidoId}`;

      const mensagem = `
🍔 *NOVO PEDIDO*

👤 ${cliente.nome}
📞 ${telefoneCliente}

📍 *ENDEREÇO*
${endereco.rua}, Nº ${endereco.numero}
${endereco.bairro} - ${endereco.cidade}/${endereco.uf}

🛒 *ITENS*
${itensTexto}

💰 *TOTAL*
R$ ${totalFinal.toFixed(2)}

🔎 *Acompanhe seu pedido:*
${urlStatus}
      `.trim();

      window.location.href = `https://wa.me/5562994524744?text=${encodeURIComponent(
        mensagem
      )}`;

      limparCarrinho();
      setCartOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar pedido.");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setCartOpen(false)}
      />

      <div className="relative bg-zinc-900 w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-3">🛒 Seu carrinho</h2>

        {cliente && (
          <div className="bg-zinc-800 p-3 rounded-xl mb-4">
            <p className="text-xs text-zinc-400 mb-1">Cliente</p>
            <p className="font-semibold">{cliente.nome}</p>
            <p className="text-sm text-zinc-300">📞 {cliente.telefone}</p>
          </div>
        )}

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
            onClick={enviarPedidoWhatsApp}
            className="w-full mt-4 bg-green-500 text-black py-3 rounded-xl font-bold"
          >
            🚚 Finalizar pedido
          </button>
        )}
      </div>
    </div>
  );
}