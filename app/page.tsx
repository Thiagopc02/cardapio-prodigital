"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import FloatingCart from "@/components/FloatingCart";
import CartModal from "@/components/CartModal";

import { Produto, getProdutosAtivos } from "@/firebase/produtos";

/* ================= CONFIG ================= */

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

/* ================= PAGE ================= */

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const lista = await getProdutosAtivos();

      // 🔥 NORMALIZA A CATEGORIA VINDO DO FIREBASE
      const normalizados: Produto[] = lista.map((p) => ({
        ...p,
        categoria: p.categoria.trim().toLowerCase(),
      }));

      console.log("🔥 PRODUTOS FIREBASE:", lista);
      console.log("🔥 PRODUTOS NORMALIZADOS:", normalizados);

      setProdutos(normalizados);
      setLoading(false);
    }

    carregar();
  }, []);

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

        {ORDEM_CATEGORIAS.map((categoria) => {
          const produtosCategoria = produtos.filter(
            (p) => p.categoria === categoria
          );

          if (produtosCategoria.length === 0) return null;

          return (
            <CategorySection
              key={categoria}
              categoria={CATEGORIAS_LABELS[categoria]}
              produtos={produtosCategoria}
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
