"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { Produto } from "@/context/CartContext";

export default function CategorySection({
  categoria,
  produtos,
}: {
  categoria: string;
  produtos: Produto[];
}) {
  const [aberta, setAberta] = useState(true);

  return (
    <section className="mt-6">
      <button
        onClick={() => setAberta(!aberta)}
        className="w-full flex justify-between items-center text-lg font-bold mb-3"
      >
        {categoria}
        <span>{aberta ? "−" : "+"}</span>
      </button>

      {aberta && (
        <div className="space-y-3">
          {produtos.map((p) => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      )}
    </section>
  );
}
