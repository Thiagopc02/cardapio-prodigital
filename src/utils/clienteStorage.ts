export type ClienteLocal = {
  nome: string;
  telefone: string;
  email: string; // ✅ ADICIONADO
  enderecos: string[];
  cadastrado: boolean;
  comprasComDesconto: number;
};

const KEY = "cliente_cardapio";

export function salvarCliente(cliente: ClienteLocal) {
  localStorage.setItem(KEY, JSON.stringify(cliente));
}

export function obterCliente(): ClienteLocal | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
}

export function limparCliente() {
  localStorage.removeItem(KEY);
}
