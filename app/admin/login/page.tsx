"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function login() {
    // ADMIN FAKE (depois trocamos por Firebase)
    if (
      email === "admin@cardapio.com" &&
      senha === "123456"
    ) {
      localStorage.setItem("admin_auth", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Acesso negado");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Login Administrativo</h1>

        <input
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-zinc-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Senha"
          type="password"
          className="w-full p-2 mb-4 rounded bg-zinc-800"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-green-500 text-black py-2 rounded font-bold"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
