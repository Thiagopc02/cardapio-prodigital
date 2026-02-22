"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { Produto } from "@/types/Produto";

type Props = {
  categoria: string;
  produtos: Produto[];
};

export default function CategorySection({ categoria, produtos }: Props) {
  const [aberta, setAberta] = useState(true);

  // evita render desnecessário quando o carrinho muda
  const listaProdutos = useMemo(() => {
    return produtos.map((produto) => (
      <ProductCard key={produto.id} produto={produto} />
    ));
  }, [produtos]);

  if (!produtos || produtos.length === 0) return null;

  return (
    <section className="mt-6">
      <button
        onClick={() => setAberta((prev) => !prev)}
        className="w-full flex justify-between items-center text-lg font-bold mb-3"
      >
        <span>{categoria}</span>
        <span>{aberta ? "−" : "+"}</span>
      </button>

      {aberta && <div className="space-y-3">{listaProdutos}</div>}
    </section>
  );
}