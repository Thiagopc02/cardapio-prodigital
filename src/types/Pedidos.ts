export type PedidoItem = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
};

export type PedidoCliente = {
  nome: string;
  telefone: string;
  email: string;
};

export type PedidoEndereco = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  uf: string;
};

export type Pedido = {
  id: string; // ✅ AGORA É OBRIGATÓRIO
  cliente: PedidoCliente;
  endereco: PedidoEndereco;
  itens: PedidoItem[];
  total: number;
  pagamento: string;
  status: "novo" | "preparando" | "finalizado";
  createdAt: unknown; // evita erro do eslint
};
