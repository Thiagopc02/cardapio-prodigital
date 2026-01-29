"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* =====================
   FUNÇÕES DE MÁSCARA
===================== */

const onlyLetters = (v: string) =>
  v.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");

const onlyNumbers = (v: string) =>
  v.replace(/\D/g, "");

const maskPhone = (v: string) => {
  v = onlyNumbers(v).slice(0, 11);
  if (v.length <= 10)
    return v.replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
  return v.replace(/(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{5})(\d)/, "$1-$2");
};

const maskCep = (v: string) =>
  onlyNumbers(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

const maskUF = (v: string) =>
  onlyLetters(v).toUpperCase().slice(0, 2);

/* =====================
   COMPONENTE
===================== */

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    celular: "",
    sexo: "",
    idade: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
  });

  function setField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function salvarCliente() {
    if (!form.nome || !form.email || !form.celular) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    localStorage.setItem(
      "cliente_fake",
      JSON.stringify(form)
    );

    router.push("/");
  }

  function loginGoogleFake() {
    localStorage.setItem(
      "cliente_fake",
      JSON.stringify({
        nome: "Cliente Google",
        email: "google@email.com",
      })
    );
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex justify-center">
      <div className="w-full max-w-md p-4 space-y-3">

        <h1 className="text-xl font-bold text-center">
          Criar conta / Entrar
        </h1>

        {/* GOOGLE */}
        <button
          onClick={loginGoogleFake}
          className="w-full bg-white text-black font-bold py-2 rounded-lg"
        >
          Entrar com Google
        </button>

        <div className="text-center text-zinc-400 text-sm">ou</div>

        {/* NOME */}
        <input
          value={form.nome}
          onChange={(e) => setField("nome", onlyLetters(e.target.value))}
          placeholder="Nome completo"
          className="w-full p-2 rounded bg-zinc-800"
        />

        {/* EMAIL */}
        <input
          value={form.email}
          onChange={(e) =>
            setField("email", e.target.value.toLowerCase().trim())
          }
          placeholder="Email"
          className="w-full p-2 rounded bg-zinc-800"
        />

        {/* CELULAR */}
        <input
          value={form.celular}
          onChange={(e) => setField("celular", maskPhone(e.target.value))}
          placeholder="Celular"
          className="w-full p-2 rounded bg-zinc-800"
        />

        {/* SEXO + IDADE */}
        <div className="flex gap-2">
          <select
            value={form.sexo}
            onChange={(e) => setField("sexo", e.target.value)}
            className="w-full p-2 rounded bg-zinc-800"
          >
            <option value="">Sexo</option>
            <option>Masculino</option>
            <option>Feminino</option>
            <option>Outro</option>
          </select>

          <input
            value={form.idade}
            onChange={(e) =>
              setField("idade", onlyNumbers(e.target.value).slice(0, 3))
            }
            placeholder="Idade"
            className="w-full p-2 rounded bg-zinc-800"
          />
        </div>

        <h2 className="font-semibold text-sm mt-2">Endereço</h2>

        {/* CEP */}
        <input
          value={form.cep}
          onChange={(e) => setField("cep", maskCep(e.target.value))}
          placeholder="CEP"
          className="w-full p-2 rounded bg-zinc-800"
        />

        {/* RUA */}
        <input
          value={form.rua}
          onChange={(e) => setField("rua", e.target.value)}
          placeholder="Rua"
          className="w-full p-2 rounded bg-zinc-800"
        />

        {/* NUMERO + BAIRRO */}
        <div className="flex gap-2">
          <input
            value={form.numero}
            onChange={(e) =>
              setField("numero", onlyNumbers(e.target.value))
            }
            placeholder="Número"
            className="w-full p-2 rounded bg-zinc-800"
          />
          <input
            value={form.bairro}
            onChange={(e) => setField("bairro", e.target.value)}
            placeholder="Bairro"
            className="w-full p-2 rounded bg-zinc-800"
          />
        </div>

        {/* CIDADE + UF */}
        <div className="flex gap-2">
          <input
            value={form.cidade}
            onChange={(e) => setField("cidade", onlyLetters(e.target.value))}
            placeholder="Cidade"
            className="w-full p-2 rounded bg-zinc-800"
          />
          <input
            value={form.estado}
            onChange={(e) => setField("estado", maskUF(e.target.value))}
            placeholder="UF"
            className="w-full p-2 rounded bg-zinc-800"
          />
        </div>

        {/* COMPLEMENTO */}
        <input
          value={form.complemento}
          onChange={(e) => setField("complemento", e.target.value)}
          placeholder="Complemento"
          className="w-full p-2 rounded bg-zinc-800"
        />

        {/* BOTÃO */}
        <button
          onClick={salvarCliente}
          className="w-full bg-green-500 text-black font-bold py-3 rounded-lg mt-2"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
