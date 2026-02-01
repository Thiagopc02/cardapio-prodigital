"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  /* ================= PROTEÇÃO ADMIN ================= */
  useEffect(() => {
    const admin = localStorage.getItem("admin_auth");
    if (!admin) {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* ================= MENU DESKTOP ================= */}
      <aside className="hidden md:flex w-64 bg-zinc-900 p-6 flex-col">
        <h2 className="text-xl font-bold mb-8">Admin</h2>

        <nav className="space-y-4">
          <Link
            href="/admin/dashboard"
            className="hover:text-green-400 transition"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/admin/produtos"
            className="hover:text-green-400 transition"
          >
            🍔 Produtos
          </Link>

          <Link
            href="/admin/categorias"
            className="hover:text-green-400 transition"
          >
            🗂️ Categorias
          </Link>
        </nav>
      </aside>

      {/* ================= CONTEÚDO ================= */}
      <div className="flex-1 flex flex-col">
        {/* ===== HEADER MOBILE ===== */}
        <header className="md:hidden flex items-center justify-between bg-zinc-900 p-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-2xl"
          >
            ☰
          </button>

          <span className="font-bold">Admin</span>
        </header>

        {/* ===== MENU MOBILE ===== */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* overlay */}
            <div
              className="flex-1 bg-black/70"
              onClick={() => setMenuOpen(false)}
            />

            {/* menu */}
            <aside className="w-64 bg-zinc-900 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Admin</h2>
                <button onClick={() => setMenuOpen(false)}>✕</button>
              </div>

              <nav className="space-y-4">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block hover:text-green-400"
                >
                  📊 Dashboard
                </Link>

                <Link
                  href="/admin/produtos"
                  onClick={() => setMenuOpen(false)}
                  className="block hover:text-green-400"
                >
                  🍔 Produtos
                </Link>

                <Link
                  href="/admin/categorias"
                  onClick={() => setMenuOpen(false)}
                  className="block hover:text-green-400"
                >
                  🗂️ Categorias
                </Link>
              </nav>
            </aside>
          </div>
        )}

        {/* ===== MAIN ===== */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
