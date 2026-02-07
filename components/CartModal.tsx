"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  /* ================= DESCONTO ================= */

  const temDesconto =
    cliente?.cadastrado && cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  /* ================= AÇÕES ================= */

  async function enviarPedidoWhatsApp() {
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

    try {
      setLoading(true);

      const telefoneFormatado = telefone.startsWith("55")
        ? `+${telefone}`
        : `+55${telefone}`;

      if (cliente?.cadastrado) {
        salvarCliente({
          ...cliente,
          nome,
          telefone,
          comprasComDesconto: cliente.comprasComDesconto + 1,
        });
      }

      await addDoc(collection(db, "pedidos"), {
        cliente: {
          nome,
          telefone: telefoneFormatado,
        },
        endereco: {
          rua: endereco.rua,
          numero: endereco.numero,
          bairro: endereco.bairro,
          cep: endereco.cep,
          complemento: endereco.complemento || "",
          cidade: endereco.cidade,
          uf: endereco.uf,
        },
        itens: carrinho.map((item) => ({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.qtd,
        })),
        total: totalFinal,
        pagamento: "entrega",
        status: "novo",
        createdAt: serverTimestamp(),
      });

      const itensTexto = carrinho
        .map(
          (item) =>
            `🍔 ${item.qtd}x ${item.nome}\n💵 ${(item.preco * item.qtd).toLocaleString(
              "pt-BR",
              { style: "currency", currency: "BRL" }
            )}`
        )
        .join("\n\n");

      const mensagem = `
🍔 *NOVO PEDIDO*
👤 ${nome}
📞 ${telefoneFormatado}

📍 *ENDEREÇO*
${endereco.rua}, Nº ${endereco.numero}
${endereco.bairro} - ${endereco.cidade}/${endereco.uf}
CEP ${endereco.cep}

🛒 *ITENS*
${itensTexto}

💰 *TOTAL*
${totalFinal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}

🚚 Pagamento na entrega
      `.trim();

      const telefoneWhatsApp = "62994524744";

      window.open(
        `https://wa.me/55${telefoneWhatsApp}?text=${encodeURIComponent(
          mensagem
        )}`,
        "_blank"
      );

      limparCarrinho();
      setCartOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar pedido.");
    } finally {
      setLoading(false);
    }
  }

  function irParaLogin() {
    setCartOpen(false);
    router.push("/login");
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setCartOpen(false)}
      />

      {/* MODAL */}
      <div className="relative bg-zinc-900 w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">🛒 Seu carrinho</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="text-red-400 font-semibold"
          >
            Fechar
          </button>
        </div>

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
          <span className="text-green-400">
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
          <button
            onClick={irParaLogin}
            className="w-full mt-3 border border-green-500 text-green-500 py-2 rounded-xl"
          >
            🎁 Cadastrar e ganhar 5% OFF
          </button>
        )}

        <button
          disabled={loading}
          onClick={enviarPedidoWhatsApp}
          className="w-full mt-3 bg-green-500 text-black py-3 rounded-xl font-bold"
        >
          🚚 Pagar na entrega
        </button>
      </div>
    </div>
  );
}
