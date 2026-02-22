// app/layout.tsx
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ClientProvider } from "@/context/ClientContext";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Cardápio Pro Digital",
  description: "Peça pelo WhatsApp sem erro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-white">
        <AuthProvider>
          <ClientProvider>
            <CartProvider>{children}</CartProvider>
          </ClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}