"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLogged } from "@/utils/adminAuth";

/* ================= TIPOS ================= */
type Categoria = {
  id: string;
  nome: string;
};

export default function CategoriasAdmin() {
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!isAdminLogged()) {
      router.replace("/admin/login");
    }
  }, [router]);

  /* ================= LOAD (LOCAL POR ENQUANTO) ================= */
  useEffect(() => {
    async function carregarCategorias() {
      // 🔥 por enquanto local (depois liga no Firebase)
      const categoriasSalvas: Categoria[] = [];

      setCategorias(categoriasSalvas);
      setLoading(false);
    }

    carregarCategorias();
  }, []);

  /* ================= ACTIONS ================= */
  function adicionarCategoria() {
    if (!nome.trim()) return;

    const novaCategoria: Categoria = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
    };

    setCategorias((prev) => [...prev, novaCategoria]);
    setNome("");
  }

  function removerCategoria(id: string) {
    if (!confirm("Remover categoria?")) return;

    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Categorias</h1>

      <div className="bg-zinc-900 p-4 rounded-xl mb-6">
        <input
          type="text"
          placeholder="Nome da categoria"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-zinc-800"
        />

        <button
          onClick={adicionarCategoria}
          className="bg-green-500 text-black px-4 py-2 rounded font-bold w-full"
        >
          ➕ Adicionar categoria
        </button>
      </div>

      {loading && (
        <p className="text-center text-zinc-400">Carregando...</p>
      )}

      {!loading && categorias.length === 0 && (
        <p className="text-center text-zinc-500">
          Nenhuma categoria cadastrada.
        </p>
      )}

      <div className="space-y-2">
        {categorias.map((c) => (
          <div
            key={c.id}
            className="bg-zinc-800 p-3 rounded flex justify-between items-center"
          >
            <span>{c.nome}</span>

            <button
              onClick={() => removerCategoria(c.id)}
              className="text-red-400 text-lg"
              title="Remover"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
