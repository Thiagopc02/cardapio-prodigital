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

  /* ================= ADICIONAR ================= */

  function adicionarEndereco(endereco: Endereco) {
    setEnderecos((prev) => {
      // 🔒 Limite de 3 endereços
      if (prev.length >= 3) return prev;

      // Remove padrão anterior
      const listaSemPadrao = prev.map((e) => ({
        ...e,
        padrao: false,
      }));

      const novoEndereco: Endereco = {
        ...endereco,
        padrao: true,
      };

      const novaLista = [...listaSemPadrao, novoEndereco];
      salvarEnderecos(novaLista);
      return novaLista;
    });
  }

  /* ================= ATUALIZAR ================= */

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

  /* ================= REMOVER ================= */

  function removerEndereco(id: string) {
    setEnderecos((prev) => {
      let lista = prev.filter((e) => e.id !== id);

      // 🔄 Se removeu o padrão, define outro como padrão
      if (!lista.some((e) => e.padrao) && lista.length > 0) {
        lista = lista.map((e, index) => ({
          ...e,
          padrao: index === 0,
        }));
      }

      salvarEnderecos(lista);
      return lista;
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

  /* ================= LIMPAR ================= */

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

/* ================= HOOK SAFE ================= */

export function useAddress(): AddressContextType {
  const ctx = useContext(AddressContext);

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