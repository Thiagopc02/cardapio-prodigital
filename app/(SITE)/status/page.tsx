import { Suspense } from "react";
import StatusClient from "./StatusClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white p-4">
          Carregando pedido...
        </div>
      }
    >
      <StatusClient />
    </Suspense>
  );
}
