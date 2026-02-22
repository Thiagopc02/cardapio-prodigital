"use client";

import { useCart } from "@/context/CartContext";

export default function FloatingCart() {
  const { carrinho, setCartOpen, cartOpen } = useCart();

  if (carrinho.length === 0 || cartOpen) return null;

  const totalItens = carrinho.reduce(
    (total, item) => total + item.qtd,
    0
  );

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="
        fixed bottom-6 right-4
        w-16 h-16
        bg-green-500
        rounded-full
        flex items-center justify-center
        text-black text-xl
        shadow-2xl
        z-[9999]
      "
      aria-label="Abrir carrinho"
    >
      🛒

      {totalItens > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            bg-red-500 text-white
            text-xs font-bold
            w-6 h-6
            rounded-full
            flex items-center justify-center
          "
        >
          {totalItens}
        </span>
      )}
    </button>
  );
}