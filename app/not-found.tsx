import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-4 text-center">
      <h1 className="text-3xl font-bold mb-2">404</h1>

      <p className="text-zinc-400 mb-6">
        Ops! A página que você tentou acessar não existe.
      </p>

      <Link
        href="/"
        className="bg-green-500 text-black px-6 py-3 rounded-xl font-semibold hover:bg-green-400 transition"
      >
        Voltar para o início
      </Link>
    </div>
  );
}