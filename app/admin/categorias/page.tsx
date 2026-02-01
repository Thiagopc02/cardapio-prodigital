"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLogged } from "@/src/utils/adminAuth";

export default function Categorias() {
  const router = useRouter();

  const [categorias, setCategorias] = useState<string[]>([]);
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (!isAdminLogged()) {
      router.replace("/admin/login");
    }
  }, [router]);

  function adicionarCategoria() {
    if (!nome.trim()) return;
    setCategorias((prev) => [...prev, nome]);
    setNome("");
  }

  return (
    <div>
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
          className="bg-green-500 text-black px-4 py-2 rounded font-bold"
        >
          Adicionar categoria
        </button>
      </div>

      <div className="space-y-2">
        {categorias.map((categoria, index) => (
          <div
            key={index}
            className="bg-zinc-800 p-3 rounded flex justify-between"
          >
            <span>{categoria}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
