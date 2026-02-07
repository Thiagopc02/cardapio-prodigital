"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function FloatingCart() {
  const { carrinho, setCartOpen } = useCart();
  const [animar, setAnimar] = useState(false);

  const totalItens = carrinho.reduce(
    (total, item) => total + item.qtd,
    0
  );

  useEffect(() => {
    if (totalItens > 0) {
      setAnimar(true);
      const timer = setTimeout(() => setAnimar(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItens]);

  if (totalItens === 0) return null;

  return (
    <button
      onClick={() => setCartOpen(true)}
      className={`
        fixed bottom-20 right-4 w-14 h-14
        bg-green-500 rounded-full text-black font-bold
        z-[9999] pointer-events-auto shadow-2xl
        flex items-center justify-center
        transition-transform
        ${animar ? "scale-110" : "scale-100"}
      `}
      aria-label="Abrir carrinho"
    >
      🛒
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {totalItens}
      </span>
    </button>
  );
}
