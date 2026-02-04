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
  preco: number;
  categoria: string; // ✅ PADRÃO FINAL
  imagem: string;
  ativo: boolean;
};

/* ================= COLLECTION ================= */

const produtosRef = collection(db, "produtos");

/* ================= ADMIN ================= */

export async function getProdutos(): Promise<Produto[]> {
  const snap = await getDocs(produtosRef);

  return snap.docs.map((d) => {
    const data = d.data();

    return {
      id: d.id,
      nome: data.nome,
      preco: data.preco,
      imagem: data.imagem,
      ativo: data.ativo,
      // 🔥 NORMALIZAÇÃO
      categoria: String(data.categoria ?? data.tipo ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
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
      nome: data.nome,
      preco: data.preco,
      imagem: data.imagem,
      ativo: data.ativo,
      // 🔥 CONVERSÃO DEFINITIVA
      categoria: String(data.categoria ?? data.tipo ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
    };
  });
}

export async function getCategorias(): Promise<string[]> {
  const produtos = await getProdutosAtivos();
  return Array.from(new Set(produtos.map((p) => p.categoria)));
}
