"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔐 Proteção admin
  useEffect(() => {
    const admin = localStorage.getItem("admin_auth");
    if (!admin) {
      router.replace("/admin/login");
    }
  }, [router]);

  function linkClass(path: string) {
    const active = pathname === path;
    return `
      flex items-center gap-2
      ${active ? "text-green-400 font-bold" : "hover:text-green-400"}
      transition
    `;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* MENU DESKTOP */}
      <aside className="hidden md:flex w-64 bg-zinc-900 p-6 flex-col border-r border-zinc-800">
        <h2 className="text-xl font-bold mb-8">Admin</h2>

        <nav className="space-y-4">
          <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
            📊 Dashboard
          </Link>
          <Link href="/admin/pedidos" className={linkClass("/admin/pedidos")}>
            🧾 Pedidos
          </Link>
          <Link href="/admin/produtos" className={linkClass("/admin/produtos")}>
            🍔 Produtos
          </Link>
          <Link href="/admin/categorias" className={linkClass("/admin/categorias")}>
            🗂️ Categorias
          </Link>
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col">
        {/* HEADER MOBILE ADMIN */}
        <header className="md:hidden flex items-center justify-between bg-zinc-900 p-4 border-b border-zinc-800">
          <button onClick={() => setMenuOpen(true)} className="text-2xl">
            ☰
          </button>
          <span className="font-bold">Admin</span>
        </header>

        {/* MENU MOBILE */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="flex-1 bg-black/70"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="w-64 bg-zinc-900 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Admin</h2>
                <button onClick={() => setMenuOpen(false)}>✕</button>
              </div>

              <nav className="space-y-4">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={linkClass("/admin/dashboard")}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/admin/pedidos"
                  onClick={() => setMenuOpen(false)}
                  className={linkClass("/admin/pedidos")}
                >
                  🧾 Pedidos
                </Link>
                <Link
                  href="/admin/produtos"
                  onClick={() => setMenuOpen(false)}
                  className={linkClass("/admin/produtos")}
                >
                  🍔 Produtos
                </Link>
                <Link
                  href="/admin/categorias"
                  onClick={() => setMenuOpen(false)}
                  className={linkClass("/admin/categorias")}
                >
                  🗂️ Categorias
                </Link>
              </nav>
            </aside>
          </div>
        )}

        {/* MAIN */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
