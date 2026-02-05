"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-md mx-auto p-4 flex items-center gap-3">
        {/* LOGO */}
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black text-lg">
          🍔
        </div>

        {/* TÍTULO */}
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">
            Cardápio Pro Digital
          </h1>
          <p className="text-xs text-zinc-400">
            Peça pelo WhatsApp sem erro
          </p>
        </div>

        {/* AÇÃO */}
        {!loading && user ? (
          <button
            onClick={handleLogout}
            className="text-xs text-red-400 font-semibold"
          >
            Sair
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="text-xs text-green-400 font-semibold"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
