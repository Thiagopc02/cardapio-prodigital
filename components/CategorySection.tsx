"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { Produto } from "@/types/Produto";

type Props = {
  categoria: string;
  produtos: Produto[];
};

export default function CategorySection({ categoria, produtos }: Props) {
  const [aberta, setAberta] = useState(true);

  if (!produtos || produtos.length === 0) return null;

  return (
    <section className="mt-6">
      <button
        onClick={() => setAberta(!aberta)}
        className="w-full flex justify-between items-center text-lg font-bold mb-3"
      >
        <span>{categoria}</span>
        <span>{aberta ? "−" : "+"}</span>
      </button>

      {aberta && (
        <div className="space-y-3">
          {produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </section>
  );
}
