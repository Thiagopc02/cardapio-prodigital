"use client";

import { createContext, useContext, useState } from "react";
import { obterCliente, salvarCliente } from "@/utils/clienteStorage";

/* ================= TIPOS ================= */

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  cadastrado: boolean;
  comprasComDesconto: number;
};

type ClientContextType = {
  cliente: Cliente | null;
  setCliente: (c: Cliente) => void;
  limparCliente: () => void;
};

/* ================= CONTEXT ================= */

const ClientContext = createContext<ClientContextType | null>(null);

/* ================= PROVIDER ================= */

export function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ inicialização SSR-safe
  const [cliente, setClienteState] = useState<Cliente | null>(() => {
    if (typeof window === "undefined") return null;
    return obterCliente();
  });

  function setCliente(c: Cliente) {
    salvarCliente(c);
    setClienteState(c);
  }

  function limparCliente() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cliente");
    }
    setClienteState(null);
  }

  return (
    <ClientContext.Provider value={{ cliente, setCliente, limparCliente }}>
      {children}
    </ClientContext.Provider>
  );
}

/* ================= HOOK (SSR SAFE) ================= */

export function useCliente(): ClientContextType {
  const ctx = useContext(ClientContext);

  // ⚠️ NUNCA lançar erro no App Router (quebra build)
  if (!ctx) {
    return {
      cliente: null,
      setCliente: () => {},
      limparCliente: () => {},
    };
  }

  return ctx;
}