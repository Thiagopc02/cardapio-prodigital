"use client";

import Image from "next/image";
import { Produto } from "@/src/types/Produto";
import { useCart } from "@/context/CartContext";

type Props = {
  produto: Produto;
};

export default function ProductCard({ produto }: Props) {
  const { adicionarProduto, removerProduto, getQuantidade } = useCart();
  const qtd = getQuantidade(produto.id);

  return (
    <div className="bg-zinc-800 rounded-xl p-3 flex gap-3 items-center">
      <Image
        src={produto.imagem}
        alt={produto.nome}
        width={60}
        height={60}
        className="rounded-lg object-cover"
      />

      <div className="flex-1">
        <p className="font-semibold">{produto.nome}</p>
        <p className="text-sm text-zinc-400">
          R$ {produto.preco.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => removerProduto(produto.id)}
          className="bg-zinc-700 px-2 rounded"
        >
          −
        </button>

        <span>{qtd}</span>

        <button
          onClick={() => adicionarProduto(produto)}
          className="bg-green-500 text-black px-2 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}
