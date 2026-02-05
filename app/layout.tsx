import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

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
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
