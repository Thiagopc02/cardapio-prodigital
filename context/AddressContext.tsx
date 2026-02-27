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
  const [enderecos, setEnderecos] = useState<Endereco[]>(carregarEnderecos);

  const enderecoSelecionado =
    enderecos.find((e) => e.padrao) || null;

  /* ================= ADICIONAR (SEM SUBSTITUIR) ================= */

  function adicionarEndereco(endereco: Endereco) {
    setEnderecos((prev) => {
      if (prev.length >= 3) return prev;

      const existePadrao = prev.some((e) => e.padrao);

      const novoEndereco: Endereco = {
        ...endereco,
        padrao: !existePadrao, // só o primeiro vira padrão
      };

      const novaLista = [...prev, novoEndereco];
      salvarEnderecos(novaLista);
      return novaLista;
    });
  }

  /* ================= SELECIONAR ================= */

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

  /* ================= REMOVER ================= */

  function removerEndereco(id: string) {
    setEnderecos((prev) => {
      const lista = prev.filter((e) => e.id !== id);

      // se removeu o padrão, define outro
      if (!lista.some((e) => e.padrao) && lista.length > 0) {
        lista[0].padrao = true;
      }

      salvarEnderecos(lista);
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