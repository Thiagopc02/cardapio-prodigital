"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/utils/adminAuth";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function handleLogin() {
    const autorizado = loginAdmin(email, senha);

    if (!autorizado) {
      setErro("Email ou senha inválidos.");
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">
          Login Administrativo
        </h1>

        {erro && (
          <p className="text-red-500 text-sm mb-3 text-center">{erro}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-zinc-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-4 p-2 rounded bg-zinc-800"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 text-black py-2 rounded font-bold"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
