import FormularioRegistro from "@/components/FormularioRegistro";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Banner Superior */}
      <header className="w-full bg-foro-blue text-white shadow-md">
        <div className="max-w-4xl mx-auto py-6 px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase">
            FORO DE COMERCIO - 2026 MONTERREY, N.L.
          </h1>
        </div>
        <div className="h-2 w-full bg-foro-orange"></div>
      </header>

      {/* Contenedor Principal */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl w-full">
          <FormularioRegistro />
        </div>
      </main>
    </div>
  );
}