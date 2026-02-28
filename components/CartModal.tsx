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
  const {
    enderecoSelecionado,
    enderecos,
    adicionarEndereco,
    removerEndereco,
    selecionarEndereco,
  } = useAddress();

  /* ================= STATE ================= */

  const [loading, setLoading] = useState(false);
  const [mostrarFormEndereco, setMostrarFormEndereco] = useState(
    !enderecoSelecionado
  );

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
${enderecoSelecionado.bairro} – ${enderecoSelecionado.cidade}/${enderecoSelecionado.uf}`
      : "Retirada no local";

    const mensagem = `
🟢 *NOVO PEDIDO*

👤 Cliente
${nome}

📞 Telefone
${formatarTelefone(telefone)}

📍 Endereço
${enderecoTexto}

📦 Itens
${itensTexto}

💰 Total
R$ ${totalFinal.toFixed(2)}

🆔 Pedido
${pedidoId}
`;

    return `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(
      mensagem
    )}`;
  }

  /* ================= MÁSCARAS ================= */

  function mascaraCep(v: string) {
    return v
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  }

  function mascaraTelefone(v: string) {
    return v
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  }

  /* ================= BUSCAR CEP ================= */

  async function buscarCep(valor: string) {
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (data.erro) return;

      setRua(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setUf(data.uf || "");
    } catch {}
  }

  /* ================= ENDEREÇO ================= */

  function salvarEndereco() {
    if (enderecos.length >= 3) {
      alert("Você pode cadastrar no máximo 3 endereços.");
      return;
    }

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

    setCep("");
    setRua("");
    setNumero("");
    setBairro("");
    setCidade("");
    setUf("");

    setMostrarFormEndereco(false);
  }

  /* ================= FINALIZAR ================= */

  async function finalizarPedido(tipo: FormaPagamento) {
    if (!nome.trim() || !telefone.trim()) {
      alert("Informe nome completo e celular.");
      return;
    }

    if (!enderecoSelecionado) {
      alert("Informe o endereço de entrega.");
      return;
    }

    if (loading) return;

    const telefoneFormatado = formatarTelefone(telefone);

    try {
      setLoading(true);

      // 🔹 Salva cliente no contexto (fonte oficial)
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
        clienteId: telefoneFormatado,
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

      // opcional: guardar último pedido
      localStorage.setItem("ultimoPedidoId", pedidoRef.id);

      if (tipo === "entrega") {
        window.location.href = gerarLinkWhatsApp(pedidoRef.id);
      } else {
        alert("Integração Mercado Pago em breve 🚀");
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
            onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
            inputMode="numeric"
          />
        </div>

        {/* ENDEREÇOS */}
        {!mostrarFormEndereco && enderecos.length > 0 && (
          <div className="bg-zinc-800 p-3 rounded-xl space-y-2">
            <p className="text-sm font-semibold text-zinc-300">
              📍 Endereços salvos
            </p>

            {enderecos.map((end) => (
              <div
                key={end.id}
                className={`flex justify-between items-center p-2 rounded-lg border ${
                  enderecoSelecionado?.id === end.id
                    ? "border-green-500 bg-green-500/10"
                    : "border-zinc-700"
                }`}
              >
                <button
                  onClick={() => selecionarEndereco(end.id)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-semibold">
                    {end.rua}, {end.numero}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {end.bairro} – {end.cidade}/{end.uf}
                  </p>
                </button>

                <button
                  onClick={() => removerEndereco(end.id)}
                  className="text-xs text-red-400 ml-2"
                >
                  Excluir
                </button>
              </div>
            ))}

            <button
              onClick={() => setMostrarFormEndereco(true)}
              className="w-full text-sm text-green-400 font-semibold mt-2"
            >
              ➕ Adicionar novo endereço
            </button>
          </div>
        )}

        {/* FORM ENDEREÇO */}
        {mostrarFormEndereco && (
          <div className="bg-zinc-800 p-3 rounded-xl space-y-2">
            <input
              className="input"
              placeholder="CEP"
              value={cep}
              onChange={(e) => {
                const v = mascaraCep(e.target.value);
                setCep(v);
                buscarCep(v);
              }}
              inputMode="numeric"
            />
            <input
              className="input"
              placeholder="Rua"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
            />
            <input
              className="input"
              placeholder="Número"
              value={numero}
              onChange={(e) =>
                setNumero(e.target.value.replace(/\D/g, ""))
              }
            />
            <input
              className="input"
              placeholder="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
            <input
              className="input"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
            <input
              className="input"
              placeholder="UF"
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
            />

            <button
              onClick={salvarEndereco}
              className="w-full bg-blue-500 text-black py-2 rounded-xl font-bold"
            >
              Salvar endereço
            </button>
          </div>
        )}

        {/* TOTAL */}
        <div className="bg-zinc-800 p-3 rounded-xl flex justify-between font-bold">
          <span>Total</span>
          <span className="text-green-400">
            R$ {totalFinal.toFixed(2)}
          </span>
        </div>

        {/* PAGAMENTO */}
        <button
          onClick={() => finalizarPedido("entrega")}
          disabled={loading}
          className="w-full bg-green-500 text-black py-3 rounded-xl font-bold"
        >
          📲 Pagar na entrega (WhatsApp)
        </button>

        <button
          onClick={() => finalizarPedido("mercadopago")}
          disabled={loading}
          className="w-full bg-blue-500 text-black py-3 rounded-xl font-bold"
        >
          💳 Pagar online (Mercado Pago)
        </button>
      </div>
    </div>
  );
}