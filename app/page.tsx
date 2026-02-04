"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import FloatingCart from "@/components/FloatingCart";
import CartModal from "@/components/CartModal";

import { Produto, getProdutosAtivos } from "@/firebase/produtos";

/* ===== CONFIG ===== */

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

/* ===== PAGE ===== */

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const lista = await getProdutosAtivos();

        console.log("🔥 PRODUTOS RAW:", lista);

        // 🔥 NORMALIZA CATEGORIA
        const normalizados: Produto[] = lista.map((p) => ({
          ...p,
          categoria: p.categoria.toLowerCase().trim(),
        }));

        console.log("🔥 PRODUTOS NORMALIZADOS:", normalizados);

        setProdutos(normalizados);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const categoriasDisponiveis = ORDEM_CATEGORIAS.filter((categoria) =>
    produtos.some((p) => p.categoria === categoria)
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

        {categoriasDisponiveis.map((categoria) => (
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
