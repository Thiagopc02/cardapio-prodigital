"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Produto } from "@/types/Produto";

/* ================= TIPOS ================= */

type ItemCarrinho = Produto & {
  qtd: number;
};

type CartContextType = {
  carrinho: ItemCarrinho[];
  adicionarProduto: (produto: Produto) => void;
  removerProduto: (id: string) => void;
  getQuantidade: (id: string) => number;
  total: number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  limparCarrinho: () => void;
};

/* ================= CONTEXT ================= */

const CartContext = createContext<CartContextType | null>(null);

/* ================= PROVIDER ================= */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  /* ================= AÇÕES ESTÁVEIS ================= */

  const adicionarProduto = useCallback((produto: Produto) => {
    setCarrinho((prev: ItemCarrinho[]) => {
      const existente = prev.find((p) => p.id === produto.id);

      if (existente) {
        return prev.map((p) =>
          p.id === produto.id ? { ...p, qtd: p.qtd + 1 } : p
        );
      }

      return [...prev, { ...produto, qtd: 1 }];
    });
  }, []);

  const removerProduto = useCallback((id: string) => {
    setCarrinho((prev: ItemCarrinho[]) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qtd: p.qtd - 1 } : p
        )
        .filter((p) => p.qtd > 0)
    );
  }, []);

  const getQuantidade = useCallback(
    (id: string) => {
      return carrinho.find((p) => p.id === id)?.qtd || 0;
    },
    [carrinho]
  );

  const limparCarrinho = useCallback(() => {
    setCarrinho([]);
    setCartOpen(false);
  }, []);

  /* ================= TOTAL MEMOIZADO ================= */

  const total = useMemo(() => {
    return carrinho.reduce(
      (soma, item) => soma + item.preco * item.qtd,
      0
    );
  }, [carrinho]);

  /* ================= VALUE ESTÁVEL ================= */

  const value = useMemo(
    () => ({
      carrinho,
      adicionarProduto,
      removerProduto,
      getQuantidade,
      total,
      cartOpen,
      setCartOpen,
      limparCarrinho,
    }),
    [
      carrinho,
      adicionarProduto,
      removerProduto,
      getQuantidade,
      total,
      cartOpen,
      limparCarrinho,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return ctx;
}