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
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-white">
        <AuthProvider>
          <CartProvider>
            <Header />
            {children}

            {/* MODAL DO CARRINHO */}
            <CartModal />

            {/* BOTÃO FLUTUANTE */}
            <FloatingCart />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
