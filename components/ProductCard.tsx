"use client";

import Image from "next/image";
import { Produto } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ produto }: { produto: Produto }) {
  const { carrinho, adicionar, remover } = useCart();
  const item = carrinho.find((i) => i.id === produto.id);

  return (
    <div className="flex gap-3 bg-zinc-800 p-3 rounded-xl">
      <Image
        src={produto.imagem}
        alt={produto.nome}
        width={70}
        height={70}
        className="rounded-lg object-cover"
      />

      <div className="flex-1">
        <p className="font-semibold">{produto.nome}</p>
        <p className="text-sm text-zinc-400">
          R$ {produto.preco.toFixed(2)}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => remover(produto)}
            className="w-8 h-8 bg-zinc-700 rounded"
          >
            −
          </button>
          <span className="w-6 text-center">{item?.qtd || 0}</span>
          <button
            onClick={() => adicionar(produto)}
            className="w-8 h-8 bg-green-500 text-black rounded"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
