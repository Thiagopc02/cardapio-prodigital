import { Suspense } from "react";
import StatusClient from "./StatusClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          <p className="text-zinc-400">Carregando pedido...</p>
        </div>
      }
    >
      <StatusClient />
    </Suspense>
  );
}