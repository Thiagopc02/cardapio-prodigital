export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-md mx-auto text-center text-xs text-zinc-500 p-3">
        © {new Date().getFullYear()} Cardápio Pro Digital <br />
        Pedidos online via WhatsApp
      </div>
    </footer>
  );
}
