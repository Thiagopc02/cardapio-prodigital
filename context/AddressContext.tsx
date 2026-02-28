"use client";

import { createContext, useContext, useEffect, useState } from "react";

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
  removerEndereco: (id: string) => void;
  selecionarEndereco: (id: string | null) => void; // ✅ aceita null
  limparEnderecos: () => void;
};

/* ================= CONTEXT ================= */

const AddressContext = createContext<AddressContextType | null>(null);

/* ================= STORAGE ================= */

const STORAGE_KEY = "enderecos";

/* ================= PROVIDER ================= */

export function AddressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /* ✅ Lazy init (SSR safe) */
  const [enderecos, setEnderecos] = useState<Endereco[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  /* 🔁 Persistência */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enderecos));
  }, [enderecos]);

  const enderecoSelecionado =
    enderecos.find((e) => e.padrao) || null;

  /* ================= ADICIONAR ================= */

  function adicionarEndereco(endereco: Endereco) {
    setEnderecos((prev) => {
      if (prev.length >= 3) return prev;

      const existePadrao = prev.some((e) => e.padrao);

      const novoEndereco: Endereco = {
        ...endereco,
        padrao: !existePadrao, // primeiro endereço vira padrão
      };

      return [...prev, novoEndereco];
    });
  }

  /* ================= SELECIONAR ================= */

  function selecionarEndereco(id: string | null) {
    // ✅ LIMPAR seleção (usado ao clicar em "Adicionar novo endereço")
    if (!id) {
      setEnderecos((prev) =>
        prev.map((e) => ({ ...e, padrao: false }))
      );
      return;
    }

    setEnderecos((prev) =>
      prev.map((e) => ({
        ...e,
        padrao: e.id === id,
      }))
    );
  }

  /* ================= REMOVER ================= */

  function removerEndereco(id: string) {
    setEnderecos((prev) => {
      const lista = prev.filter((e) => e.id !== id);

      // garante que sempre exista um padrão
      if (!lista.some((e) => e.padrao) && lista.length > 0) {
        return lista.map((e, index) => ({
          ...e,
          padrao: index === 0,
        }));
      }

      return lista;
    });
  }

  /* ================= LIMPAR ================= */

  function limparEnderecos() {
    setEnderecos([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AddressContext.Provider
      value={{
        enderecos,
        enderecoSelecionado,
        adicionarEndereco,
        removerEndereco,
        selecionarEndereco,
        limparEnderecos,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

/* ================= HOOK SAFE ================= */

export function useAddress(): AddressContextType {
  const ctx = useContext(AddressContext);

  if (!ctx) {
    return {
      enderecos: [],
      enderecoSelecionado: null,
      adicionarEndereco: () => {},
      removerEndereco: () => {},
      selecionarEndereco: () => {},
      limparEnderecos: () => {},
    };
  }

  return ctx;
}