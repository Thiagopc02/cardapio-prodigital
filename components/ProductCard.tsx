"use client";

import Image from "next/image";
import { memo } from "react";
import { Produto } from "@/types/Produto";
import { useCart } from "@/context/CartContext";

type Props = {
  produto: Produto;
};

function ProductCardComponent({ produto }: Props) {
  const { adicionarProduto, removerProduto, getQuantidade } = useCart();
  const qtd = getQuantidade(produto.id);

  const imagemValida =
    produto.imagem && produto.imagem.startsWith("/")
      ? produto.imagem
      : "/produtos/placeholder.png";

  return (
    <div className="bg-zinc-800 rounded-xl p-3 flex gap-3 items-center">
      <Image
        src={imagemValida}
        alt={produto.nome}
        width={60}
        height={60}
        className="rounded-lg object-cover"
        priority={false}
      />

      <div className="flex-1">
        <p className="font-semibold">{produto.nome}</p>
        <p className="text-sm text-zinc-400">
          R$ {produto.preco.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => qtd > 0 && removerProduto(produto.id)}
          disabled={qtd === 0}
          className="bg-zinc-700 px-2 rounded disabled:opacity-40"
          aria-label="Remover produto"
        >
          −
        </button>

        <span className="min-w-4 text-center">{qtd}</span>

        <button
          onClick={() => adicionarProduto(produto)}
          className="bg-green-500 text-black px-2 rounded"
          aria-label="Adicionar produto"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default memo(ProductCardComponent);