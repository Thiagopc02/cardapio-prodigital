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

/* ================= CONFIG ================= */

const CATEGORIAS_LABELS: Record<string, string> = {
  lanches: "Lanches",
  bebidas: "Bebidas",
  combos: "Combos",
  sobremesas: "Sobremesas",
  outros: "Outros",
};

const ORDEM_CATEGORIAS = [
  "lanches",
  "bebidas",
  "combos",
  "sobremesas",
  "outros",
];

/* ================= PAGE ================= */

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        const listaProdutos = await getProdutosAtivos();
        const listaCategorias = await getCategorias();

        console.log("🔥 PRODUTOS:", listaProdutos);
        console.log("🔥 CATEGORIAS:", listaCategorias);

        setProdutos(listaProdutos);
        setCategorias(listaCategorias);
      } catch (error) {
        console.error("❌ Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  /* ================= ESTADOS ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-zinc-400">
          Carregando produtos...
        </main>
        <Footer />
      </div>
    );
  }

  if (!loading && produtos.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-red-400">
          Nenhum produto encontrado.
        </main>
        <Footer />
      </div>
    );
  }

  /* ================= CATEGORIAS ================= */

  const categoriasOrdenadas = ORDEM_CATEGORIAS.filter((c) =>
    categorias.includes(c)
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Header />

      <main className="flex-1 px-4 pb-32 max-w-md mx-auto w-full">
        {categoriasOrdenadas.map((categoria) => {
          const produtosDaCategoria = produtos.filter(
            (p) => p.categoria === categoria
          );

          if (produtosDaCategoria.length === 0) return null;

          return (
            <CategorySection
              key={categoria}
              categoria={CATEGORIAS_LABELS[categoria] ?? categoria}
              produtos={produtosDaCategoria}
            />
          );
        })}
      </main>

      <FloatingCart />
      <CartModal />
      <Footer />
    </div>
  );
}
