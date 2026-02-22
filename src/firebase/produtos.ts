import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./config";

/* ================= TIPOS ================= */

export type Produto = {
  id: string;
  nome: string;
  preco: number;      // 🔥 SEMPRE number
  categoria: string;
  imagem: string;
  ativo: boolean;
};

/* ================= COLLECTION ================= */

const produtosRef = collection(db, "produtos");

/* ================= HELPERS ================= */

function normalizarCategoria(valor: unknown): string {
  return String(valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function converterPreco(valor: unknown): number {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

/* ================= ADMIN ================= */

export async function getProdutos(): Promise<Produto[]> {
  const snap = await getDocs(produtosRef);

  return snap.docs.map((d) => {
    const data = d.data();

    return {
      id: d.id,
      nome: String(data.nome ?? ""),
      preco: converterPreco(data.preco), // 🔥 AQUI
      imagem: String(data.imagem ?? ""),
      ativo: Boolean(data.ativo),
      categoria: normalizarCategoria(data.categoria ?? data.tipo),
    };
  });
}

export async function addProduto(produto: Omit<Produto, "id">) {
  await addDoc(produtosRef, produto);
}

export async function deleteProduto(id: string) {
  await deleteDoc(doc(db, "produtos", id));
}

/* ================= SITE PÚBLICO ================= */

export async function getProdutosAtivos(): Promise<Produto[]> {
  const q = query(produtosRef, where("ativo", "==", true));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();

    return {
      id: d.id,
      nome: String(data.nome ?? ""),
      preco: converterPreco(data.preco), // 🔥 AQUI TAMBÉM
      imagem: String(data.imagem ?? ""),
      ativo: Boolean(data.ativo),
      categoria: normalizarCategoria(data.categoria ?? data.tipo),
    };
  });
}

export async function getCategorias(): Promise<string[]> {
  const produtos = await getProdutosAtivos();
  return Array.from(new Set(produtos.map((p) => p.categoria)));
}