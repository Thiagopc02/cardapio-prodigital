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

  // 🔒 Proteção extra
  if (!produto || !produto.id) return null;

  const qtd = getQuantidade(produto.id);

  // 🔒 Imagem 100% segura (sem 404)
  const imagemSegura =
    produto.imagem && produto.imagem.startsWith("/")
      ? produto.imagem
      : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='100%' height='100%' fill='%23333333'/><text x='50%' y='50%' fill='%23999999' font-size='10' text-anchor='middle' dominant-baseline='middle'>SEM IMAGEM</text></svg>";

  return (
    <div className="bg-zinc-800 rounded-xl p-3 flex gap-3 items-center">
      <Image
        src={imagemSegura}
        alt={produto.nome}
        width={60}
        height={60}
        className="rounded-lg object-cover"
        unoptimized
      />

      <div className="flex-1">
        <p className="font-semibold">{produto.nome}</p>
        <p className="text-sm text-zinc-400">
          R$ {produto.preco.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => removerProduto(produto.id)}
          disabled={qtd === 0}
          className="bg-zinc-700 px-2 rounded disabled:opacity-40"
        >
          −
        </button>

        <span className="min-w-4 text-center">{qtd}</span>

        <button
          type="button"
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