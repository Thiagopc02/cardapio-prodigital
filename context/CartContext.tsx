"use client";

import { createContext, useContext, useState } from "react";
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
  const [cartOpen, setCartOpen] = useState(false); // 🔒 fechado por padrão

  function adicionarProduto(produto: Produto) {
    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === produto.id);

      if (existente) {
        return prev.map((p) =>
          p.id === produto.id ? { ...p, qtd: p.qtd + 1 } : p
        );
      }

      return [...prev, { ...produto, qtd: 1 }];
    });
  }

  function removerProduto(id: string) {
    setCarrinho((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qtd: p.qtd - 1 } : p
        )
        .filter((p) => p.qtd > 0)
    );
  }

  function getQuantidade(id: string) {
    return carrinho.find((p) => p.id === id)?.qtd || 0;
  }

  function limparCarrinho() {
    setCarrinho([]);
    setCartOpen(false); // 🔒 boa prática: fecha o carrinho ao limpar
  }

  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.qtd,
    0
  );

  return (
    <CartContext.Provider
      value={{
        carrinho,
        adicionarProduto,
        removerProduto,
        getQuantidade,
        total,
        cartOpen,
        setCartOpen,
        limparCarrinho,
      }}
    >
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