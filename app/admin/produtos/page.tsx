"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLogged } from "@/src/utils/adminAuth";

/* ================= TIPOS ================= */
type Produto = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
};

/* ================= PRODUTOS FIXOS (APRESENTAÇÃO) ================= */
const PRODUTOS_INICIAIS: Produto[] = [
  { id: 1, nome: "X-Burger", preco: 18, imagem: "/produtos/x-burger.png" },
  { id: 2, nome: "X-Salada", preco: 22, imagem: "/produtos/x-salada.png" },
  { id: 3, nome: "Batata Frita", preco: 12, imagem: "/produtos/batata.png" },
  { id: 4, nome: "Combo Kids", preco: 15, imagem: "/produtos/kids.png" },
];

export default function Produtos() {
  const router = useRouter();

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!isAdminLogged()) {
      router.replace("/admin/login");
    }
  }, [router]);

  /* ================= STATES ================= */
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [imagem, setImagem] = useState<string>("");
  const [filtro, setFiltro] = useState("");
  const [ordem, setOrdem] = useState<"asc" | "desc">("asc");

  /* ================= DRAG & DROP ================= */
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagem(url);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagem(url);
    }
  }

  /* ================= FILTRO + ORDENAÇÃO ================= */
  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter((p) =>
        p.nome.toLowerCase().includes(filtro.toLowerCase())
      )
      .sort((a, b) =>
        ordem === "asc" ? a.preco - b.preco : b.preco - a.preco
      );
  }, [produtos, filtro, ordem]);

  /* ================= AÇÕES ================= */
  function adicionarProduto() {
    if (!nome || !preco) return;

    setProdutos((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome,
        preco: Number(preco),
        imagem: imagem || "/produtos/x-burger.png",
      },
    ]);

    setNome("");
    setPreco("");
    setImagem("");
  }

  function excluirProduto(id: number) {
    if (!confirm("Deseja excluir este produto?")) return;
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }

  /* ================= UI ================= */
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      {/* ================= FORM ================= */}
      <div className="bg-zinc-900 p-4 rounded-xl mb-6 space-y-3">
        <input
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
        />

        {/* IMAGEM */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center cursor-pointer bg-zinc-800"
        >
          {imagem ? (
            <Image
              src={imagem}
              alt="Preview"
              width={120}
              height={120}
              className="mx-auto rounded"
            />
          ) : (
            <p className="text-zinc-400">
              Arraste a imagem aqui ou clique para selecionar
            </p>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="fileInput"
          />
        </div>

        <label
          htmlFor="fileInput"
          className="block text-center text-sm text-green-400 cursor-pointer"
        >
          Selecionar imagem
        </label>

        <button
          onClick={adicionarProduto}
          className="bg-green-500 text-black px-4 py-2 rounded font-bold w-full sm:w-auto"
        >
          ➕ Adicionar produto
        </button>
      </div>

      {/* ================= FILTROS ================= */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          placeholder="Filtrar por nome"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-1 p-2 rounded bg-zinc-800"
        />

        <select
          value={ordem}
          onChange={(e) => setOrdem(e.target.value as "asc" | "desc")}
          className="p-2 rounded bg-zinc-800"
        >
          <option value="asc">Preço ↑</option>
          <option value="desc">Preço ↓</option>
        </select>
      </div>

      {/* ================= LISTAGEM ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtosFiltrados.map((produto) => (
          <div
            key={produto.id}
            className="bg-zinc-900 rounded-xl p-4 flex gap-4 items-center"
          >
            <Image
              src={produto.imagem}
              alt={produto.nome}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold">{produto.nome}</p>
              <p className="text-green-400 font-bold">
                R$ {produto.preco.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => excluirProduto(produto.id)}
              className="text-red-500 hover:text-red-400"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
