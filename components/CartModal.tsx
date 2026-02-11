"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useCart } from "@/context/CartContext";
import { obterCliente, salvarCliente } from "@/utils/clienteStorage";

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
  const { carrinho, total, cartOpen, setCartOpen, limparCarrinho } = useCart();

  const cliente =
    typeof window !== "undefined" ? obterCliente() : null;

  const [loading, setLoading] = useState(false);

  const [endereco, setEndereco] = useState<Endereco>({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
    cidade: "",
    uf: "",
  });

  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("pix");

  const [trocoPara, setTrocoPara] = useState("");

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
      });
  }, [endereco.cep]);

  if (!cartOpen) return null;

  /* ================= DESCONTO ================= */

  const temDesconto =
    cliente?.cadastrado && cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  /* ================= VALIDAR ================= */

  function validarPedido() {
    if (!cliente) {
      alert("Cliente não identificado.");
      return false;
    }

    if (
      !endereco.cep ||
      !endereco.rua ||
      !endereco.numero ||
      !endereco.bairro
    ) {
      alert("Preencha todos os dados do endereço.");
      return false;
    }

    if (formaPagamento === "dinheiro" && !trocoPara) {
      alert("Informe o valor do troco.");
      return false;
    }

    return true;
  }

  /* ================= FINALIZAR PEDIDO ================= */

  async function enviarPedidoWhatsApp() {
    if (loading) return;
    if (!validarPedido()) return;
    if (!cliente) return;

    try {
      setLoading(true);

      const pedidoId = crypto.randomUUID();

      const telefoneCliente = cliente.telefone.startsWith("+")
        ? cliente.telefone
        : `+55${cliente.telefone.replace(/\D/g, "")}`;

      /* ✅ ATUALIZA CLIENTE (TIPO COMPLETO) */
      salvarCliente({
        id: cliente.id,
        nome: cliente.nome,
        telefone: telefoneCliente,
        cadastrado: true,
        comprasComDesconto: cliente.comprasComDesconto + 1,
      });

      /* ================= FIRESTORE ================= */

      await addDoc(collection(db, "pedidos"), {
        pedidoId,
        cliente: {
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
        pagamento: {
          tipo: formaPagamento,
          trocoPara:
            formaPagamento === "dinheiro" ? trocoPara : null,
        },
        status: "novo",
        createdAt: serverTimestamp(),
      });

      /* ================= WHATSAPP ================= */

      const itensTexto = carrinho
        .map(
          (i) =>
            `• ${i.qtd}x ${i.nome} — R$ ${(i.preco * i.qtd).toFixed(2)}`
        )
        .join("\n");

      const pagamentoTexto =
        formaPagamento === "dinheiro"
          ? `Dinheiro (troco para ${trocoPara})`
          : formaPagamento === "pix"
          ? "Pix"
          : "Cartão";

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

💳 *PAGAMENTO*
${pagamentoTexto}

🔎 *Acompanhe seu pedido:*
${urlStatus}
      `.trim();

      window.location.href = `https://wa.me/5562994524744?text=${encodeURIComponent(
        mensagem
      )}`;

      limparCarrinho();
      setCartOpen(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao finalizar pedido.");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-9998 flex items-end justify-center">
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

        <button
          disabled={loading}
          onClick={enviarPedidoWhatsApp}
          className="w-full mt-4 bg-green-500 text-black py-3 rounded-xl font-bold"
        >
          🚚 Finalizar pedido
        </button>
      </div>
    </div>
  );
}
