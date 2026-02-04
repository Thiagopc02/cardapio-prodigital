"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLogged } from "@/utils/adminAuth";

import {
  Produto,
  getProdutos,
  addProduto,
  deleteProduto,
} from "@/firebase/produtos";

export default function ProdutosAdmin() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState("");
  const [filtro, setFiltro] = useState("");

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!isAdminLogged()) router.replace("/admin/login");
  }, [router]);

  /* ================= LOAD ================= */
  useEffect(() => {
    (async () => {
      const lista = await getProdutos();
      setProdutos(lista);
    })();
  }, []);

  /* ================= IMAGE ================= */
  function handleImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => setImagem(reader.result as string);
    reader.readAsDataURL(file);
  }

  /* ================= ACTIONS ================= */
  async function salvar() {
    if (!nome || !preco || !categoria) return;

    await addProduto({
      nome,
      preco: Number(preco),
      categoria,
      imagem: imagem || "/produtos/placeholder.png",
      ativo: true,
    });

    setNome("");
    setPreco("");
    setCategoria("");
    setImagem("");

    const lista = await getProdutos();
    setProdutos(lista);
  }

  async function remover(id: string) {
    if (!confirm("Excluir produto?")) return;

    await deleteProduto(id);
    const lista = await getProdutos();
    setProdutos(lista);
  }

  const filtrados = useMemo(
    () =>
      produtos.filter((p) =>
        p.nome.toLowerCase().includes(filtro.toLowerCase())
      ),
    [produtos, filtro]
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      <div className="bg-zinc-900 p-4 rounded-xl space-y-3 mb-6">
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
        />

        <input
          placeholder="Preço"
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
        />

        <input
          placeholder="Categoria (ex: lanches)"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleImage(e.target.files[0])
          }
        />

        <button
          onClick={salvar}
          className="bg-green-500 text-black px-4 py-2 rounded font-bold"
        >
          ➕ Adicionar produto
        </button>
      </div>

      <input
        placeholder="Filtrar por nome"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-zinc-800"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((p) => (
          <div
            key={p.id}
            className="bg-zinc-900 p-4 rounded-xl flex gap-3 items-center"
          >
            <Image
              src={p.imagem}
              alt={p.nome}
              width={80}
              height={80}
              className="rounded object-cover"
            />

            <div className="flex-1">
              <p className="font-bold">{p.nome}</p>
              <p className="text-green-400">
                R$ {p.preco.toFixed(2)}
              </p>
              <p className="text-xs text-zinc-400">{p.categoria}</p>
            </div>

            <button
              onClick={() => remover(p.id)}
              className="text-red-500"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
