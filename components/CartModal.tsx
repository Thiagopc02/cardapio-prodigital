"use client";

import Image from "next/image";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { useCliente } from "@/context/ClientContext";
import { useAddress } from "@/context/AddressContext";

/* ================= TIPOS ================= */

type FormaPagamento = "entrega" | "mercadopago";

/* ================= COMPONENTE ================= */

export default function CartModal() {
  const { carrinho, total, cartOpen, setCartOpen, limparCarrinho } = useCart();
  const { cliente, setCliente } = useCliente();
  const { enderecoSelecionado } = useAddress();

  const [loading, setLoading] = useState(false);

  // Cliente
  const [nome, setNome] = useState(cliente?.nome || "");
  const [telefone, setTelefone] = useState(cliente?.telefone || "");

  /* ================= DESCONTO ================= */

  const temDesconto =
    !!cliente &&
    typeof cliente.comprasComDesconto === "number" &&
    cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  if (!cartOpen) return null;

  /* ================= HELPERS ================= */

  function formatarTelefone(tel: string) {
    const limpo = tel.replace(/\D/g, "");
    return limpo.startsWith("55") ? `+${limpo}` : `+55${limpo}`;
  }

  function gerarLinkWhatsApp(pedidoId: string) {
    const telefoneEmpresa = "62994524744";

    const itensTexto = carrinho
      .map(
        (i) =>
          `• ${i.qtd}x ${i.nome} — R$ ${(i.preco * i.qtd).toFixed(2)}`
      )
      .join("\n");

    const enderecoTexto = enderecoSelecionado
      ? `${enderecoSelecionado.rua}, ${enderecoSelecionado.numero}
${enderecoSelecionado.bairro} — ${enderecoSelecionado.cidade}/${enderecoSelecionado.uf}`
      : "Retirada no local";

    const hora = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const mensagem = 
`🛒 *NOVO PEDIDO — CARDÁPIO PRO DIGITAL*

👤 *Cliente:* ${nome}
📞 *Telefone:* ${formatarTelefone(telefone)}

📍 *Entrega:*
${enderecoTexto}

📦 *Itens do pedido:*
${itensTexto}

💰 *Total:* R$ ${totalFinal.toFixed(2)}

🆔 *Código do pedido:*
${pedidoId}

⏰ *Horário:* ${hora}

✅ Pedido recebido com sucesso.`;

    return `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(
      mensagem
    )}`;
  }

  /* ================= FINALIZAR ================= */

  async function finalizarPedido(tipo: FormaPagamento) {
    if (!nome.trim() || !telefone.trim()) {
      alert("Informe nome completo e celular.");
      return;
    }

    if (!enderecoSelecionado) {
      alert("Selecione um endereço para entrega.");
      return;
    }

    if (loading) return;

    const telefoneFormatado = formatarTelefone(telefone);

    try {
      setLoading(true);

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

      const pedidoRef = await addDoc(collection(db, "pedidos"), {
        cliente: { nome, telefone: telefoneFormatado },
        endereco: enderecoSelecionado,
        itens: carrinho.map((i) => ({
          id: i.id,
          nome: i.nome,
          preco: i.preco,
          quantidade: i.qtd,
        })),
        total: totalFinal,
        pagamento: { tipo },
        status: "novo",
        createdAt: serverTimestamp(),
      });

      if (tipo === "entrega") {
        window.location.href = gerarLinkWhatsApp(pedidoRef.id);
      }

      limparCarrinho();
      setCartOpen(false);
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

      <div className="relative bg-zinc-900 w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="font-bold text-lg">🛒 Seu carrinho</h2>

        {carrinho.map((item) => (
          <div key={item.id} className="flex gap-3 bg-zinc-800 p-3 rounded-xl">
            <Image
              src={item.imagem || "/produtos/placeholder.png"}
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
            inputMode="numeric"
          />
        </div>

        {/* TOTAL */}
        <div className="bg-zinc-800 p-3 rounded-xl flex justify-between font-bold">
          <span>Total</span>
          <span className="text-green-400">
            R$ {totalFinal.toFixed(2)}
          </span>
        </div>

        {/* PAGAMENTOS */}
        <button
          onClick={() => finalizarPedido("entrega")}
          disabled={loading}
          className="w-full bg-green-500 text-black py-3 rounded-xl font-bold"
        >
          📲 Pagar na entrega (WhatsApp)
        </button>

        <button
          onClick={() => alert("Integração Mercado Pago em breve 🚀")}
          className="w-full bg-blue-500 text-black py-3 rounded-xl font-bold"
        >
          💳 Pagar online (Mercado Pago)
        </button>
      </div>
    </div>
  );
}