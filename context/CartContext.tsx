"use client";

import { createContext, useContext, useState, ReactNode } from "react";


export type Produto = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
};

type CartItem = Produto & { qtd: number };

type CartContextType = {
  carrinho: CartItem[];
  adicionar: (produto: Produto) => void;
  remover: (produto: Produto) => void;
  total: number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  function adicionar(produto: Produto) {
    setCarrinho((prev) => {
      const existe = prev.find((p) => p.id === produto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === produto.id ? { ...p, qtd: p.qtd + 1 } : p
        );
      }
      return [...prev, { ...produto, qtd: 1 }];
    });
  }

  function remover(produto: Produto) {
    setCarrinho((prev) =>
      prev
        .map((p) =>
          p.id === produto.id ? { ...p, qtd: p.qtd - 1 } : p
        )
        .filter((p) => p.qtd > 0)
    );
  }

  const total = carrinho.reduce(
    (acc, item) => acc + item.preco * item.qtd,
    0
  );

  return (
    <CartContext.Provider
      value={{ carrinho, adicionar, remover, total, cartOpen, setCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro do CartProvider");
  return ctx;
}
