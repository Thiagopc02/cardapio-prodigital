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
};

/* ================= UTIL ================= */
function extrairEnderecoSeguro(enderecos: unknown): Endereco {
  if (
    Array.isArray(enderecos) &&
    typeof enderecos[0] === "object" &&
    enderecos[0] !== null
  ) {
    const e = enderecos[0] as Partial<Endereco>;
    return {
      cep: e.cep ?? "",
      rua: e.rua ?? "",
      numero: e.numero ?? "",
      bairro: e.bairro ?? "",
      complemento: e.complemento ?? "",
    };
  }

  return {
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
  };
}

/* ================= COMPONENTE ================= */
export default function CartModal() {
  const { carrinho, total, cartOpen, setCartOpen } = useCart();
  const router = useRouter();

  /* ================= CLIENTE (LOGIN FAKE) ================= */
  const cliente =
    typeof window !== "undefined" ? obterCliente() : null;

  /* ================= STATES ================= */
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [nome, setNome] = useState(cliente?.nome ?? "");

  const [endereco, setEndereco] = useState<Endereco>(() =>
    extrairEnderecoSeguro(cliente?.enderecos)
  );

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
          }));
        }
      });
  }, [endereco.cep]);

  if (!cartOpen) return null;

  /* ================= DESCONTO ================= */
  const temDesconto =
    cliente?.cadastrado && cliente.comprasComDesconto < 2;

  const totalFinal = temDesconto ? total * 0.95 : total;

  /* ================= FINALIZAR PEDIDO ================= */
  function finalizarPedido(tipoPagamento: "agora" | "entrega") {
    if (
      !telefone ||
      !nome ||
      !endereco.cep ||
      !endereco.rua ||
      !endereco.numero ||
      !endereco.bairro
    ) {
      alert("Preencha todos os dados corretamente.");
      return;
    }

    let mensagem = "🧾 *Pedido*:%0A";

    carrinho.forEach((item) => {
      mensagem += `• ${item.nome} (${item.qtd}x) - R$ ${(
        item.preco * item.qtd
      ).toFixed(2)}%0A`;
    });

    mensagem += `%0A💰 *Total:* R$ ${totalFinal.toFixed(2)}`;
    if (temDesconto) mensagem += " (5% OFF)";

    mensagem += `%0A👤 *Nome:* ${nome}`;
    mensagem += `%0A📞 *Telefone:* ${telefone}`;
    mensagem += `%0A📍 *Endereço:* ${endereco.rua}, ${endereco.numero} - ${endereco.bairro}`;

    if (endereco.complemento) {
      mensagem += ` (${endereco.complemento})`;
    }

    mensagem += `%0A💳 *Pagamento:* ${
      tipoPagamento === "agora"
        ? "Pagar agora (PIX / Crédito / Débito)"
        : "Pagar na entrega (Dinheiro / PIX / Cartão)"
    }`;

    if (cliente?.cadastrado) {
      salvarCliente({
        ...cliente,
        comprasComDesconto: cliente.comprasComDesconto + 1,
      });
    }

    window.open(
      `https://wa.me/5599999999999?text=${mensagem}`,
      "_blank"
    );
  }

  /* ================= IR PARA LOGIN ================= */
  function irParaLogin() {
    setCartOpen(false);
    router.push("/login");
  }

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setCartOpen(false)}
      />

      {/* MODAL */}
      <div className="relative bg-zinc-900 w-full max-w-md rounded-2xl p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-3">
          <h2 className="font-bold text-lg">Seu carrinho</h2>
          <button onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {/* ITENS */}
        <div className="space-y-3">
          {carrinho.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 bg-zinc-800 p-3 rounded-xl"
            >
              <Image
                src={item.imagem}
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
        </div>

        {/* TOTAL */}
        <div className="mt-4 border-t border-zinc-700 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>R$ {totalFinal.toFixed(2)}</span>
        </div>

        {/* DADOS */}
        <div className="mt-4 space-y-2">
          <input
            placeholder="Telefone"
            value={telefone}
            onChange={(e) =>
              setTelefone(e.target.value.replace(/\D/g, ""))
            }
            className="w-full p-2 rounded bg-zinc-800"
          />

          <input
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800"
          />

          <input
            placeholder="CEP"
            value={endereco.cep}
            onChange={(e) =>
              setEndereco({
                ...endereco,
                cep: e.target.value.replace(/\D/g, ""),
              })
            }
            className="w-full p-2 rounded bg-zinc-800"
          />

          <input
            placeholder="Rua"
            value={endereco.rua}
            onChange={(e) =>
              setEndereco({ ...endereco, rua: e.target.value })
            }
            className="w-full p-2 rounded bg-zinc-800"
          />

          <div className="flex gap-2">
            <input
              placeholder="Número"
              value={endereco.numero}
              onChange={(e) =>
                setEndereco({ ...endereco, numero: e.target.value })
              }
              className="w-1/2 p-2 rounded bg-zinc-800"
            />
            <input
              placeholder="Bairro"
              value={endereco.bairro}
              onChange={(e) =>
                setEndereco({ ...endereco, bairro: e.target.value })
              }
              className="w-1/2 p-2 rounded bg-zinc-800"
            />
          </div>

          <input
            placeholder="Complemento (opcional)"
            value={endereco.complemento}
            onChange={(e) =>
              setEndereco({
                ...endereco,
                complemento: e.target.value,
              })
            }
            className="w-full p-2 rounded bg-zinc-800"
          />
        </div>

        {/* CTA LOGIN */}
        {!cliente?.cadastrado && (
          <button
            onClick={irParaLogin}
            className="w-full mt-3 border border-green-500 text-green-500 py-2 rounded-xl"
          >
            Cadastrar e ganhar 5% OFF 🎁
          </button>
        )}

        <button
          onClick={() => finalizarPedido("agora")}
          className="w-full mt-3 bg-zinc-700 py-2 rounded-xl"
        >
          💳 Pagar agora (PIX / Crédito / Débito)
        </button>

        <button
          onClick={() => finalizarPedido("entrega")}
          className="w-full mt-2 bg-green-500 text-black py-3 rounded-xl font-bold"
        >
          🚚 Pagar na entrega (Dinheiro / PIX / Cartão)
        </button>
      </div>
    </div>
  );
}
