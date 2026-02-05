"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const lista = await getProdutosAtivos();

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
      <main className="flex-1 px-4 pb-32 max-w-md mx-auto space-y-4">

        {/* ================= CTA HOME ================= */}
        {!authLoading && (
          <div className="bg-zinc-950 border border-green-500/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            {user ? (
              <div className="text-green-400 text-sm font-semibold">
                👋 Olá, <b>{user.displayName || user.email}</b>
                <div className="text-xs text-green-300">
                  boas compras 😎
                </div>
              </div>
            ) : (
              <div className="text-green-400 text-sm font-semibold">
                🎁 Cadastre-se e ganhe <b>5% OFF</b>
                <div className="text-xs font-normal text-green-300">
                  nas 2 primeiras compras
                </div>
              </div>
            )}

            {!user && (
              <button
                onClick={() => router.push("/login")}
                className="bg-green-500 text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition"
              >
                Cadastrar
              </button>
            )}
          </div>
        )}

        {/* ================= PRODUTOS ================= */}

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
