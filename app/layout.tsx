// app/layout.tsx

import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}