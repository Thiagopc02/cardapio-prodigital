"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import FloatingCart from "@/components/FloatingCart";
import CartModal from "@/components/CartModal";

import { Produto, getProdutosAtivos } from "@/firebase/produtos";

/* Labels amigáveis */
const CATEGORIAS_LABELS: Record<string, string> = {
  lanches: "lanches",
  bebidas: "bebidas",
  combos: "combos",
  sobremesas: "sobremesas",
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const lista = await getProdutosAtivos();

      console.log("🔥 PRODUTOS RAW:", lista);

      /* Normaliza categorias vindas do Firestore */
      const produtosNormalizados: Produto[] = lista.map((p) => ({
        ...p,
        categoria: p.categoria.trim().toLowerCase(),
      }));

      console.log("🔥 PRODUTOS NORMALIZADOS:", produtosNormalizados);

      const categoriasUnicas = Array.from(
        new Set(produtosNormalizados.map((p) => p.categoria))
      );

      setProdutos(produtosNormalizados);
      setCategorias(categoriasUnicas);
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

        {categorias.map((categoria) => (
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
