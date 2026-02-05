"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { obterCliente, salvarCliente } from "@/src/utils/clienteStorage";
import { criarPedido } from "@/src/firebase/pedidos";

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
  const { carrinho, total, cartOpen, setCartOpen } = useCart();
  const router = useRouter();

  const cliente =
    typeof window !== "undefined" ? obterCliente() : null;

  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "cliente@local.app");

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

  /* ================= FINALIZAR PEDIDO ================= */
  async function finalizarPedido(tipoPagamento: "agora" | "entrega") {
    if (
      !nome ||
      !telefone ||
      !email ||
      !endereco.cep ||
      !endereco.rua ||
      !endereco.numero ||
      !endereco.bairro ||
      !endereco.cidade ||
      !endereco.uf
    ) {
      alert("Preencha todos os dados corretamente.");
      return;
    }

    try {
      setLoading(true);

      const pedidoId = await criarPedido({
        status: "novo",
        total: totalFinal,
        pagamento: tipoPagamento,
        cliente: {
          nome,
          telefone,
          email,
        },
        endereco,
        itens: carrinho.map((item) => ({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.qtd, // ✅ AJUSTE CRÍTICO
        })),
      });

      if (cliente?.cadastrado) {
        salvarCliente({
          ...cliente,
          comprasComDesconto: cliente.comprasComDesconto + 1,
        });
      }

      let mensagem = "🧾 *Pedido*:%0A";
      carrinho.forEach((item) => {
        mensagem += `• ${item.nome} (${item.qtd}x) - R$ ${(item.preco * item.qtd).toFixed(2)}%0A`;
      });

      mensagem += `%0A💰 *Total:* R$ ${totalFinal.toFixed(2)}`;
      mensagem += `%0A👤 *Nome:* ${nome}`;
      mensagem += `%0A📞 *Telefone:* ${telefone}`;
      mensagem += `%0A📍 *Endereço:* ${endereco.rua}, ${endereco.numero} - ${endereco.bairro}`;
      mensagem += `%0A🆔 *Pedido:* ${pedidoId}`;

      window.open(
        `https://wa.me/5599999999999?text=${mensagem}`,
        "_blank"
      );

      setCartOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar pedido");
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

        <div className="mt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>R$ {totalFinal.toFixed(2)}</span>
        </div>

        <div className="mt-4 space-y-2">
          <input className="w-full p-2 rounded bg-zinc-800" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input className="w-full p-2 rounded bg-zinc-800" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
            Cadastrar e ganhar 5% OFF 🎁
          </button>
        )}

        <button disabled={loading} onClick={() => finalizarPedido("agora")} className="w-full mt-3 bg-zinc-700 py-2 rounded-xl">
          💳 Pagar agora
        </button>

        <button disabled={loading} onClick={() => finalizarPedido("entrega")} className="w-full mt-2 bg-green-500 text-black py-3 rounded-xl font-bold">
          🚚 Pagar na entrega
        </button>
      </div>
    </div>
  );
}
