import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

/* ================= TIPOS ================= */

export type PedidoItem = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
};

export type PedidoInput = {
  cliente: {
    uid?: string; // ✅ opcional
    nome: string;
    email: string;
    telefone: string;
  };
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    complemento?: string;
  };
  itens: PedidoItem[];
  total: number;
  pagamento: "agora" | "entrega";
  status?: "novo" | "preparando" | "finalizado";
};

/* ================= CRIAR PEDIDO ================= */

export async function criarPedido(pedido: PedidoInput) {
  const docRef = await addDoc(collection(db, "pedidos"), {
    ...pedido,
    status: pedido.status ?? "novo",
    criadoEm: serverTimestamp(),
  });

  return docRef.id;
}
