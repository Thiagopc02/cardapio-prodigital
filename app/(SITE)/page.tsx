"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function StatusPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Enquanto carrega auth
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <p className="text-zinc-400">Carregando...</p>
      </div>
    );
  }

  // Se não estiver logado, volta para home
  if (!user) {
    router.replace("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <main className="flex-1 max-w-md mx-auto p-4 space-y-4">
        {/* VOLTAR */}
        <button
          onClick={() => router.push("/")}
          className="text-green-400 font-semibold"
        >
          ← Voltar para o cardápio
        </button>

        {/* CARD STATUS */}
        <div className="bg-zinc-800 rounded-xl p-4">
          <h1 className="text-lg font-bold mb-2">📦 Acompanhar pedidos</h1>

          <p className="text-sm text-zinc-400">
            Aqui você poderá acompanhar o status dos seus pedidos.
          </p>
        </div>

        {/* PLACEHOLDER DE PEDIDOS */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-center">
          <p className="text-zinc-500 text-sm">
            Nenhum pedido encontrado no momento.
          </p>
        </div>
      </main>
    </div>
  );
}