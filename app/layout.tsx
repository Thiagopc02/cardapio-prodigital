// app/layout.tsx
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ClientProvider } from "@/context/ClientContext";
import { CartProvider } from "@/context/CartContext";
import { AddressProvider } from "@/context/AddressContext";

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
            <AddressProvider>
              <CartProvider>{children}</CartProvider>
            </AddressProvider>
          </ClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}