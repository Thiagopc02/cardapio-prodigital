"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import FloatingCart from "@/components/FloatingCart";
import CartModal from "@/components/CartModal";

import { Produto, getProdutosAtivos } from "@/firebase/produtos";

/* ================= TIPOS ================= */

type ProdutoNormalizado = Produto & {
  categoriaNormalizada: string;
};

/* ================= UTIL ================= */

function normalizarCategoria(valor: string) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

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
  const [produtos, setProdutos] = useState<ProdutoNormalizado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const lista = await getProdutosAtivos();

      console.log("🔥 PRODUTOS RAW:", lista);

      const produtosNormalizados: ProdutoNormalizado[] = lista.map((p) => ({
        ...p,
        categoriaNormalizada: normalizarCategoria(p.categoria),
      }));

      console.log("🔥 PRODUTOS NORMALIZADOS:", produtosNormalizados);

      setProdutos(produtosNormalizados);
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

        {!loading &&
          ORDEM_CATEGORIAS.map((categoria) => {
            const produtosDaCategoria = produtos.filter(
              (p) => p.categoriaNormalizada === categoria
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
