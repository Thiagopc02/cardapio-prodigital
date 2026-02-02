"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import FloatingCart from "@/components/FloatingCart";
import CartModal from "@/components/CartModal";

import {
  Produto,
  getProdutosAtivos,
  getCategorias,
} from "@/firebase/produtos"; // ✅ CORRETO

const CATEGORIAS_LABELS: Record<string, string> = {
  lanches: "Lanches",
  bebidas: "Bebidas",
  combos: "Combos",
  sobremesas: "Sobremesas",
};

const ORDEM_CATEGORIAS = [
  "lanches",
  "bebidas",
  "combos",
  "sobremesas",
];

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const listaProdutos = await getProdutosAtivos();
      const listaCategorias = await getCategorias();

      setProdutos(listaProdutos);
      setCategorias(listaCategorias);
    })();
  }, []);

  const categoriasOrdenadas = ORDEM_CATEGORIAS.filter((c) =>
    categorias.includes(c)
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Header />

      <main className="flex-1 px-4 pb-32 max-w-md mx-auto">
        {categoriasOrdenadas.map((categoria) => (
          <CategorySection
            key={categoria}
            categoria={CATEGORIAS_LABELS[categoria] ?? categoria}
            produtos={produtos.filter(
              (p) => p.categoria === categoria
            )}
          />
        ))}
      </main>

      <FloatingCart />
      <CartModal />
      <Footer />
    </div>
  );
}
