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
} from "@/firebase/produtos";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const listaProdutos = await getProdutosAtivos();
      const listaCategorias = await getCategorias();

      console.log("🔥 PRODUTOS:", listaProdutos);
      console.log("🔥 CATEGORIAS:", listaCategorias);

      setProdutos(listaProdutos);
      setCategorias(listaCategorias);
      setLoading(false);
    })();
  }, []);

  const categoriasOrdenadas = ORDEM_CATEGORIAS.filter((c) =>
    categorias.includes(c)
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Header />

      <main className="flex-1 px-4 pb-32 max-w-md mx-auto">
        {loading && (
          <p className="text-center text-zinc-400 mt-10">
            Carregando produtos...
          </p>
        )}

        {!loading && produtos.length === 0 && (
          <p className="text-center text-red-400 mt-10">
            Nenhum produto encontrado.
          </p>
        )}

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
