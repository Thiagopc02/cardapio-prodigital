export type Produto = {
  id: string;          // Firestore usa string
  nome: string;
  preco: number;
  categoria: string;
  imagem: string;
  ativo: boolean;
};
