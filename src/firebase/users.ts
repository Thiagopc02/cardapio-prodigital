import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

export type Usuario = {
  uid: string;
  nome: string;
  email: string;
  telefone?: string;
  sexo?: string;
  idade?: number;
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    complemento?: string;
  };
  createdAt: Date;
};

export async function salvarUsuario(usuario: Usuario) {
  const ref = doc(db, "users", usuario.uid);
  const snap = await getDoc(ref);

  // só cria se não existir
  if (!snap.exists()) {
    await setDoc(ref, usuario);
  }
}
