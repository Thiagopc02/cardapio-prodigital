// app/(SITE)/layout.tsx
import "../globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    <>
      <Header />

      {children}

      {/* Modal do carrinho (controlado pelo CartContext) */}
      <CartModal />

      {/* Botão flutuante */}
      <FloatingCart />

      <Footer />
    </>
  );
}