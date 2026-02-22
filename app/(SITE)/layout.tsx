import "../globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

import Header from "@/components/Header";
import FloatingCart from "@/components/FloatingCart";
import CartModal from "@/components/CartModal";

export const metadata = {
  title: "Cardápio Pro Digital",
  description: "Peça pelo WhatsApp sem erro",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />

        {children}

        {/* Modal do carrinho (sempre montado, controlado internamente) */}
        <CartModal />

        {/* Botão flutuante */}
        <FloatingCart />
      </CartProvider>
    </AuthProvider>
  );
}