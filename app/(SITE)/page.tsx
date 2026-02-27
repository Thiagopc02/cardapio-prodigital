"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import CategorySection from "@/components/CategorySection";
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

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);

  /* ================= BUSCA PRODUTOS ================= */

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const lista = await getProdutosAtivos();

        const normalizados: Produto[] = lista.map((p) => ({
          ...p,
          categoria: p.categoria.trim().toLowerCase(),
        }));

        setProdutos(normalizados);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setLoadingProdutos(false);
      }
    }

    carregarProdutos();
  }, []);

  /* ================= AGRUPAMENTO ================= */

  const produtosPorCategoria = useMemo(() => {
    const map: Record<string, Produto[]> = {};
    for (const produto of produtos) {
      if (!map[produto.categoria]) {
        map[produto.categoria] = [];
      }
      map[produto.categoria].push(produto);
    }
    return map;
  }, [produtos]);

  /* ================= LOADING AUTH ================= */

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <p className="text-zinc-400">Carregando cardápio...</p>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <main className="flex-1 px-4 pb-32 max-w-md mx-auto space-y-4">
      {/* ================= CTA HOME ================= */}
      <div className="bg-zinc-950 border border-green-500/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        {user ? (
          <div className="text-green-400 text-sm font-semibold">
            👋 Olá, <b>{user.displayName || user.email}</b>
            <div className="text-xs text-green-300">boas compras 😎</div>

            <button
              onClick={() => router.push("/status")}
              className="mt-1 text-xs text-red-400 font-bold hover:underline"
            >
              🔴 Acompanhar pedidos
            </button>
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

      {/* ================= PRODUTOS ================= */}

      {loadingProdutos && (
        <p className="text-center text-zinc-400 mt-10">
          Carregando produtos...
        </p>
      )}

      {!loadingProdutos && produtos.length === 0 && (
        <p className="text-center text-red-400 mt-10">
          Nenhum produto encontrado.
        </p>
      )}

      {!loadingProdutos &&
        ORDEM_CATEGORIAS.map((categoria) => {
          const lista = produtosPorCategoria[categoria];
          if (!lista || lista.length === 0) return null;

          return (
            <CategorySection
              key={categoria}
              categoria={CATEGORIAS_LABELS[categoria]}
              produtos={lista}
            />
          );
        })}
    </main>
  );
}