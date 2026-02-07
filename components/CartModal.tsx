"use client";

import { useCart } from "@/context/CartContext";

export default function CartModal() {
  const {
    carrinho,
    cartOpen,
    setCartOpen,
    adicionarProduto,
    removerProduto,
    total,
    limparCarrinho,
  } = useCart();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 flex justify-center items-end">
      <div className="bg-zinc-900 w-full max-w-md rounded-t-2xl p-4 animate-slideUp">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">🛒 Seu carrinho</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="text-red-400 font-bold"
          >
            Fechar
          </button>
        </div>

        {/* ITENS */}
        {carrinho.length === 0 ? (
          <p className="text-zinc-400 text-sm">
            Seu carrinho está vazio.
          </p>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {carrinho.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-zinc-800 rounded-lg p-3"
              >
                <div>
                  <p className="font-semibold">{item.nome}</p>
                  <p className="text-xs text-zinc-400">
                    R$ {item.preco.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removerProduto(item.id)}
                    className="w-7 h-7 bg-zinc-700 rounded text-white"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">
                    {item.qtd}
                  </span>
                  <button
                    onClick={() => adicionarProduto(item)}
                    className="w-7 h-7 bg-green-500 rounded text-black font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="border-t border-zinc-700 mt-4 pt-4 space-y-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-green-400">
              R$ {total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => {
              // aqui depois entra WhatsApp
              alert("Finalizar pedido (próximo passo)");
            }}
            className="w-full bg-green-500 text-black font-bold py-3 rounded-lg"
          >
            Finalizar pedido
          </button>

          <button
            onClick={limparCarrinho}
            className="w-full text-xs text-red-400"
          >
            Limpar carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
