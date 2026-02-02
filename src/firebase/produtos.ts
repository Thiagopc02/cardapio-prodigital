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
  categoria: string;
  imagem: string;
  ativo: boolean;
};

/* ================= COLLECTION ================= */

const produtosRef = collection(db, "produtos");

/* ================= ADMIN ================= */

export async function getProdutos(): Promise<Produto[]> {
  const snap = await getDocs(produtosRef);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Produto, "id">),
  }));
}

export async function addProduto(produto: Omit<Produto, "id">) {
  await addDoc(produtosRef, produto);
}

export async function deleteProduto(id: string) {
  const ref = doc(db, "produtos", id);
  await deleteDoc(ref);
}

/* ================= SITE PÚBLICO ================= */

export async function getProdutosAtivos(): Promise<Produto[]> {
  const q = query(produtosRef, where("ativo", "==", true));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Produto, "id">),
  }));
}

export async function getCategorias(): Promise<string[]> {
  const produtos = await getProdutosAtivos();
  return Array.from(new Set(produtos.map((p) => p.categoria)));
}
