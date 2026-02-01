export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-zinc-400">Produtos</p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-zinc-400">Categorias</p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-zinc-400">Status</p>
          <p className="text-green-400 font-bold">Sistema ativo</p>
        </div>
      </div>
    </div>
  );
}
