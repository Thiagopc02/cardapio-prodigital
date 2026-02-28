import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import {
  PedidoItem,
  PedidoEndereco,
  PedidoCliente,
  PedidoStatus,
} from "@/types/Pedidos";

/* =========================
   INPUT PARA CRIAÇÃO
   ========================= */

export type CriarPedidoInput = {
  clienteId: string; // 🔑 telefone formatado (+55...)
  cliente: PedidoCliente;
  endereco: PedidoEndereco;
  itens: PedidoItem[];
  total: number;
  pagamento: {
    tipo: "entrega" | "mercadopago";
  };
  status?: PedidoStatus;
};

/* =========================
   CRIAR PEDIDO (SITE)
   ========================= */

export async function criarPedido(input: CriarPedidoInput): Promise<string> {
  const docRef = await addDoc(collection(db, "pedidos"), {
    clienteId: input.clienteId,
    cliente: input.cliente,
    endereco: input.endereco,
    itens: input.itens,
    total: input.total,
    pagamento: input.pagamento,
    status: input.status ?? "novo",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}