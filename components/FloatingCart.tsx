"use client";

import { useCart } from "@/context/CartContext";

export default function FloatingCart() {
  const { carrinho, setCartOpen } = useCart();

  if (carrinho.length === 0) return null;

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="
        fixed
        bottom-20
        right-4
        w-14
        h-14
        bg-green-500
        rounded-full
        text-black
        font-bold
        z-[9999]
        pointer-events-auto
        shadow-2xl
      "
      aria-label="Abrir carrinho"
    >
      🛒
    </button>
  );
}
