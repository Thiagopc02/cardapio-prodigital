"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLogged } from "@/src/utils/adminAuth";

/* ================= TIPOS ================= */
type Produto = {
  id: number;
  nome: string;
  preco: number;
};

/* ================= PRODUTOS INICIAIS ================= */
const PRODUTOS_INICIAIS: Produto[] = [
  { id: 1, nome: "X-Burger", preco: 18 },
  { id: 2, nome: "X-Salada", preco: 22 },
  { id: 3, nome: "Batata Frita", preco: 12 },
  { id: 4, nome: "Combo Kids", preco: 15 },
];

export default function Produtos() {
  const router = useRouter();

  /* ✅ Estado já inicializado corretamente */
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  /* ================= PROTEÇÃO ADMIN ================= */
  useEffect(() => {
    if (!isAdminLogged()) {
      router.replace("/admin/login");
    }
  }, [router]);

  /* ================= ADICIONAR PRODUTO ================= */
  function adicionarProduto() {
    if (!nome.trim() || !preco) return;

    const novoProduto: Produto = {
      id: Date.now(),
      nome,
      preco: Number(preco),
    };

    setProdutos((prev) => [...prev, novoProduto]);
    setNome("");
    setPreco("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      {/* FORMULÁRIO */}
      <div className="bg-zinc-900 p-4 rounded-xl mb-6">
        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-zinc-800"
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-zinc-800"
        />

        <button
          onClick={adicionarProduto}
          className="bg-green-500 text-black px-4 py-2 rounded font-bold"
        >
          Adicionar produto
        </button>
      </div>

      {/* LISTAGEM */}
      <div className="space-y-2">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="bg-zinc-800 p-3 rounded flex justify-between items-center"
          >
            <span className="font-medium">{produto.nome}</span>
            <span className="text-green-400 font-bold">
              R$ {produto.preco.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
