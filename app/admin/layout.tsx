"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem("admin_auth");
    if (!admin) {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* MENU */}
      <aside className="w-64 bg-zinc-900 p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-6">Admin</h2>
        <nav className="space-y-3">
          <a href="/admin/dashboard" className="block hover:text-green-400">
            📊 Dashboard
          </a>
          <a href="/admin/produtos" className="block hover:text-green-400">
            🍔 Produtos
          </a>
          <a href="/admin/categorias" className="block hover:text-green-400">
            🗂️ Categorias
          </a>
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
