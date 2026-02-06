// ================= TIPOS =================

export type ClienteLocal = {
  id: string; // 🔑 IDENTIFICADOR ÚNICO DO CLIENTE
  nome: string;
  telefone: string;
  email?: string;
  enderecos?: string[];
  cadastrado: boolean;
  comprasComDesconto: number;
};

// ================= CONFIG =================

const KEY = "cliente_cardapio";

// ================= HELPERS =================

// Gera um ID simples e confiável (sem lib externa)
function gerarIdCliente() {
  return `cli_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ================= FUNÇÕES =================

export function salvarCliente(cliente: ClienteLocal) {
  localStorage.setItem(KEY, JSON.stringify(cliente));
}

export function obterCliente(): ClienteLocal | null {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem(KEY);
  if (!data) return null;

  const cliente: ClienteLocal = JSON.parse(data);

  // 🔥 GARANTE ID PARA CLIENTES ANTIGOS
  if (!cliente.id) {
    const clienteAtualizado: ClienteLocal = {
      ...cliente,
      id: gerarIdCliente(),
    };

    salvarCliente(clienteAtualizado);
    return clienteAtualizado;
  }

  return cliente;
}

export function criarClienteSeNaoExistir(
  dados: Omit<ClienteLocal, "id" | "comprasComDesconto">
): ClienteLocal {
  const clienteExistente = obterCliente();
  if (clienteExistente) return clienteExistente;

  const novoCliente: ClienteLocal = {
    id: gerarIdCliente(),
    comprasComDesconto: 0,
    ...dados,
  };

  salvarCliente(novoCliente);
  return novoCliente;
}

export function limparCliente() {
  localStorage.removeItem(KEY);
}
