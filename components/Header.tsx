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
      <div className="max-w-md mx-auto p-4 flex flex-col gap-3">

        {/* LINHA PRINCIPAL */}
        <div className="flex items-center gap-3">
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

        {/* CTA */}
        <div className="flex items-center justify-between gap-2 bg-zinc-900 border border-green-500/40 rounded-xl px-3 py-2">
          {!loading && user ? (
            <div className="text-green-400 text-sm font-semibold">
              👋 Olá,{" "}
              <b>{user.displayName || user.email}</b>
              <div className="text-xs text-green-300">
                boas compras 😎
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
              <span className="text-lg">🎁</span>
              <span>
                Cadastre-se e ganhe <b>5% OFF</b>
                <br />
                <span className="text-xs font-normal text-green-300">
                  nas 2 primeiras compras
                </span>
              </span>
            </div>
          )}

          {!loading && !user && (
            <button
              onClick={() => router.push("/login")}
              className="bg-green-500 text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition"
            >
              Cadastrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
