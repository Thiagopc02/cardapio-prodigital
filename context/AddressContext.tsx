"use client";

import { createContext, useContext, useState } from "react";

/* ================= TIPOS ================= */

export type Endereco = {
  id: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  uf: string;
  padrao?: boolean;
};

type AddressContextType = {
  enderecos: Endereco[];
  enderecoSelecionado: Endereco | null;
  adicionarEndereco: (endereco: Endereco) => void;
  atualizarEndereco: (endereco: Endereco) => void;
  removerEndereco: (id: string) => void;
  selecionarEndereco: (id: string) => void;
  limparEnderecos: () => void;
};

/* ================= CONTEXT ================= */

const AddressContext = createContext<AddressContextType | null>(null);

/* ================= STORAGE ================= */

const STORAGE_KEY = "enderecos";

function carregarEnderecos(): Endereco[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function salvarEnderecos(enderecos: Endereco[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enderecos));
}

/* ================= PROVIDER ================= */

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [enderecos, setEnderecos] = useState<Endereco[]>(() =>
    carregarEnderecos()
  );

  const enderecoSelecionado =
    enderecos.find((e) => e.padrao) || null;

  function adicionarEndereco(endereco: Endereco) {
    setEnderecos((prev) => {
      const lista = endereco.padrao
        ? prev.map((e) => ({ ...e, padrao: false }))
        : prev;

      const novaLista = [...lista, endereco];
      salvarEnderecos(novaLista);
      return novaLista;
    });
  }

  function atualizarEndereco(endereco: Endereco) {
    setEnderecos((prev) => {
      let lista = prev.map((e) =>
        e.id === endereco.id ? endereco : e
      );

      if (endereco.padrao) {
        lista = lista.map((e) => ({
          ...e,
          padrao: e.id === endereco.id,
        }));
      }

      salvarEnderecos(lista);
      return lista;
    });
  }

  function removerEndereco(id: string) {
    setEnderecos((prev) => {
      const lista = prev.filter((e) => e.id !== id);
      salvarEnderecos(lista);
      return lista;
    });
  }

  function selecionarEndereco(id: string) {
    setEnderecos((prev) => {
      const lista = prev.map((e) => ({
        ...e,
        padrao: e.id === id,
      }));
      salvarEnderecos(lista);
      return lista;
    });
  }

  function limparEnderecos() {
    setEnderecos([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <AddressContext.Provider
      value={{
        enderecos,
        enderecoSelecionado,
        adicionarEndereco,
        atualizarEndereco,
        removerEndereco,
        selecionarEndereco,
        limparEnderecos,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

/* ================= HOOK (APP ROUTER SAFE) ================= */

export function useAddress(): AddressContextType {
  const ctx = useContext(AddressContext);

  // ❗ NUNCA lançar erro no App Router
  if (!ctx) {
    return {
      enderecos: [],
      enderecoSelecionado: null,
      adicionarEndereco: () => {},
      atualizarEndereco: () => {},
      removerEndereco: () => {},
      selecionarEndereco: () => {},
      limparEnderecos: () => {},
    };
  }

  return ctx;
}