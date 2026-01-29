"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ClienteFake = {
  nome: string;
  email: string;
};

export default function Header() {
  const router = useRouter();

  const [cliente, setCliente] = useState<ClienteFake | null>(() => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("cliente_fake");
    return data ? JSON.parse(data) : null;
  });

  function handleLogout() {
    localStorage.removeItem("cliente_fake");
    setCliente(null);
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
          {cliente ? (
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
          {cliente ? (
            <div className="text-green-400 text-sm font-semibold">
              👋 Olá, <b>{cliente.nome}</b>
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

          {!cliente && (
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
