"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/firebase/config";

import { useCliente } from "@/context/ClientContext";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { setCliente, limparCliente } = useCliente();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // 🔗 CONECTA LOGIN → CLIENTE
        setCliente({
          id: firebaseUser.uid,
          nome: firebaseUser.displayName || "Cliente",
          telefone: firebaseUser.phoneNumber || "",
          cadastrado: true,
          comprasComDesconto: 0,
        });
      } else {
        limparCliente();
      }

      setLoading(false);
    });

    return () => unsub();
  }, [setCliente, limparCliente]);

  async function logout() {
    await signOut(auth);
    limparCliente();
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}