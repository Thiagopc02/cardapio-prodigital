/* =========================
   ITENS DO PEDIDO
   ========================= */
export type PedidoItem = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
};

/* =========================
   CLIENTE DO PEDIDO
   ========================= */
export type PedidoCliente = {
  nome: string;
  telefone: string; // sempre no formato +55...
};

/* =========================
   ENDEREÇO DO PEDIDO
   ========================= */
export type PedidoEndereco = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  uf: string;
};

/* =========================
   STATUS DO PEDIDO
   ========================= */
export type PedidoStatus =
  | "novo"
  | "preparando"
  | "em_rota"
  | "finalizado";

/* =========================
   PEDIDO (FIRESTORE)
   ========================= */
export type Pedido = {
  id: string; // doc.id do Firestore

  clienteId: string; // 🔑 telefone formatado (+55...)
  cliente: PedidoCliente;

  endereco: PedidoEndereco;

  itens: PedidoItem[];

  total: number;

  pagamento: {
    tipo: "entrega" | "mercadopago";
  };

  status: PedidoStatus;

  createdAt: unknown; // Timestamp | FieldValue (SSR-safe)
};