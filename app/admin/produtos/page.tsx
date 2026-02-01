"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLogged } from "@/src/utils/adminAuth";

/* ================= TIPOS ================= */
type Produto = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
};

/* ================= PRODUTOS MOCK (APRESENTAÇÃO) ================= */
const PRODUTOS_INICIAIS: Produto[] = [
  {
    id: 1,
    nome: "X-Burger",
    preco: 18,
    imagem: "/produtos/x-burger.png",
  },
  {
    id: 2,
    nome: "X-Salada",
    preco: 22,
    imagem: "/produtos/x-salada.png",
  },
  {
    id: 3,
    nome: "Batata Frita",
    preco: 12,
    imagem: "/produtos/batata.png",
  },
  {
    id: 4,
    nome: "Combo Kids",
    preco: 15,
    imagem: "/produtos/kids.png",
  },
];

export default function Produtos() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  /* ================= PROTEÇÃO ADMIN ================= */
  useEffect(() => {
    if (!isAdminLogged()) {
      router.replace("/admin/login");
    }
  }, [router]);

  /* ================= ADICIONAR PRODUTO (DEMO) ================= */
  function adicionarProduto() {
    if (!nome || !preco) return;

    const novoProduto: Produto = {
      id: Date.now(),
      nome,
      preco: Number(preco),
      imagem: "/produtos/refri.png", // imagem padrão para demo
    };

    setProdutos((prev) => [...prev, novoProduto]);
    setNome("");
    setPreco("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      {/* FORMULÁRIO */}
      <div className="bg-zinc-900 p-4 rounded-xl mb-6 max-w-xl">
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
          className="bg-green-500 text-black px-4 py-2 rounded font-bold w-full sm:w-auto"
        >
          Adicionar produto
        </button>
      </div>

      {/* LISTAGEM RESPONSIVA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="bg-zinc-900 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={produto.imagem}
                alt={produto.nome}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold">{produto.nome}</p>
              <p className="text-green-400 font-bold">
                R$ {produto.preco.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
