"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { obterCliente, salvarCliente } from "@/src/utils/clienteStorage";

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

/* ================= COMPONENTE ================= */

export default function CartModal() {
  const {
    carrinho,
    total,
    cartOpen,
    setCartOpen,
    limparCarrinho,
  } = useCart();

  const router = useRouter();

  const cliente =
    typeof window !== "undefined" ? obterCliente() : null;

  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");

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
      });
  }, [endereco.cep]);

  if (!cartOpen) return null;

  const temDesconto =
    cliente?.cadastrado && cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  /* ================= WHATSAPP ================= */

  function enviarPedidoWhatsApp() {
    if (loading) return;

    if (
      !nome ||
      !telefone ||
      !endereco.cep ||
      !endereco.rua ||
      !endereco.numero ||
      !endereco.bairro
    ) {
      alert("Preencha todos os dados corretamente.");
      return;
    }

    setLoading(true);

    if (cliente?.cadastrado) {
      salvarCliente({
        ...cliente,
        nome,
        telefone,
        comprasComDesconto: cliente.comprasComDesconto + 1,
      });
    }

    const itensTexto = carrinho
      .map(
        (item) =>
          `🍔 ${item.qtd}x ${item.nome}\n   💵 ${(
            item.preco * item.qtd
          ).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}`
      )
      .join("\n\n");

    const mensagem = `
🟢🟢🟢🟢🟢🟢🟢🟢
🍔✨ *NOVO PEDIDO* ✨🍔
📲 *CARDÁPIO DIGITAL*
🟢🟢🟢🟢🟢🟢🟢🟢

👤🙋 *CLIENTE*
👉 ${nome}

📞📱 *CONTATO*
👉 ${telefone}

📍🏠 *ENDEREÇO DE ENTREGA*
👉 ${endereco.rua}, Nº ${endereco.numero}
👉 Bairro ${endereco.bairro}
👉 CEP ${endereco.cep}

🧾🛒 *ITENS DO PEDIDO*
${itensTexto}

💰💳 *TOTAL*
👉 ${totalFinal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}

🚚💵 *PAGAMENTO*
👉 Na entrega

🙏🍀 Obrigado pela preferência!
⚡ Pedido enviado pelo Cardápio Digital
    `.trim();

    const telefoneWhatsApp = "62994524744";

    const url = `https://wa.me/55${telefoneWhatsApp}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(url, "_blank");

    limparCarrinho();
    setCartOpen(false);
    setLoading(false);
  }

  /* ================= PAGAMENTO ONLINE (FUTURO) ================= */

  function pagarAgora() {
    alert("Pagamento online será integrado em breve 💳");
  }

  function irParaLogin() {
    setCartOpen(false);
    router.push("/login");
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setCartOpen(false)}
      />

      <div className="relative bg-zinc-900 w-full max-w-md rounded-2xl p-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-3">Seu carrinho</h2>

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
                {item.qtd}x •{" "}
                {(item.preco * item.qtd).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        ))}

        <div className="mt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>
            {totalFinal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <input className="w-full p-2 rounded bg-zinc-800" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input className="w-full p-2 rounded bg-zinc-800" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))} />
          <input className="w-full p-2 rounded bg-zinc-800" placeholder="CEP" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: e.target.value.replace(/\D/g, "") })} />
          <input className="w-full p-2 rounded bg-zinc-800" placeholder="Rua" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} />
          <div className="flex gap-2">
            <input className="w-1/2 p-2 rounded bg-zinc-800" placeholder="Número" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} />
            <input className="w-1/2 p-2 rounded bg-zinc-800" placeholder="Bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} />
          </div>
        </div>

        {!cliente?.cadastrado && (
          <button onClick={irParaLogin} className="w-full mt-3 border border-green-500 text-green-500 py-2 rounded-xl">
            🎁 Cadastrar e ganhar 5% OFF
          </button>
        )}

        <button onClick={pagarAgora} className="w-full mt-3 bg-zinc-700 py-2 rounded-xl">
          💳 Pagar agora
        </button>

        <button
          disabled={loading}
          onClick={enviarPedidoWhatsApp}
          className="w-full mt-2 bg-green-500 text-black py-3 rounded-xl font-bold"
        >
          🚚 Pagar na entrega
        </button>
      </div>
    </div>
  );
}
