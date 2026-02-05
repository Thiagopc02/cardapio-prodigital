import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

type PedidoItem = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
};

type PedidoInput = {
  cliente: {
    uid: string;
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
};

export async function criarPedido(pedido: PedidoInput) {
  await addDoc(collection(db, "pedidos"), {
    ...pedido,
    status: "novo",
    criadoEm: serverTimestamp(),
  });
}
