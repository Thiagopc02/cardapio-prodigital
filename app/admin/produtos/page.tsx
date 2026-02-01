"use client";

import { useState } from "react";

type Produto = {
  nome: string;
  preco: number;
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  function adicionarProduto() {
    if (!nome || !preco) return;

    setProdutos([
      ...produtos,
      {
        nome,
        preco: Number(preco),
      },
    ]);

    setNome("");
    setPreco("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

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

      <div className="space-y-2">
        {produtos.map((produto, index) => (
          <div
            key={index}
            className="bg-zinc-800 p-3 rounded flex justify-between"
          >
            <span>{produto.nome}</span>
            <span>R$ {produto.preco.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
