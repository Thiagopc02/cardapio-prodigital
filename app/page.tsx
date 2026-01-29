"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import FloatingCart from "@/components/FloatingCart";
import CartModal from "@/components/CartModal";

/* ================= TIPOS ================= */

export type Categoria =
  | "Promoções"
  | "Mais Vendidos"
  | "Hamburgueres"
  | "Porções"
  | "KIDS"
  | "Refrescos e Sucos"
  | "Raspadinhas"
  | "Cremes";

export type Produto = {
  id: number;
  nome: string;
  preco: number;
  categoria: Categoria;
  imagem: string;
};

/* ================= DADOS MOCK ================= */

const categorias: Categoria[] = [
  "Promoções",
  "Mais Vendidos",
  "Hamburgueres",
  "Porções",
  "KIDS",
  "Refrescos e Sucos",
  "Raspadinhas",
  "Cremes",
];

const produtos: Produto[] = [
  { id: 1, nome: "X-Burger", preco: 18, categoria: "Hamburgueres", imagem: "/produtos/x-burger.png" },
  { id: 2, nome: "X-Salada", preco: 22, categoria: "Hamburgueres", imagem: "/produtos/x-salada.png" },
  { id: 3, nome: "Batata Frita", preco: 12, categoria: "Porções", imagem: "/produtos/batata.png" },
  { id: 4, nome: "Refrigerante", preco: 6, categoria: "Refrescos e Sucos", imagem: "/produtos/refri.png" },
  { id: 5, nome: "Combo Kids", preco: 15, categoria: "KIDS", imagem: "/produtos/kids.png" },
  { id: 6, nome: "Raspadinha", preco: 5, categoria: "Raspadinhas", imagem: "/produtos/raspadinha.png" },
  { id: 7, nome: "Creme Gelado", preco: 8, categoria: "Cremes", imagem: "/produtos/creme.png" },
];

/* ================= PAGE ================= */

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Header />

      {/* LISTAGEM DE CATEGORIAS + PRODUTOS */}
      <main className="flex-1 px-4 pb-32 max-w-md mx-auto">
        {categorias.map((categoria) => (
          <CategorySection
            key={categoria}
            categoria={categoria}
            produtos={produtos.filter(
              (p) => p.categoria === categoria
            )}
          />
        ))}
      </main>

      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      <FloatingCart />

      {/* MODAL DO CARRINHO (controlado via CONTEXT) */}
      <CartModal />

      <Footer />
    </div>
  );
}
