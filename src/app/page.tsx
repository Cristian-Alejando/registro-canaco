import FormularioRegistro from "@/components/FormularioRegistro";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Registro al Evento CANACO</h1>
      <FormularioRegistro />
    </main>
  );
}