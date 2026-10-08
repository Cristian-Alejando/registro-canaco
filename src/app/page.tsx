import FormularioRegistro from "@/components/FormularioRegistro";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent w-full">
      <Hero />
      {/* Se elimina el bg-slate-50 para dejar ver el fondo global del layout */}
      <div className="flex flex-col flex-grow px-4 md:px-8 pb-12">
        {/* Contenedor Principal de la Tarjeta del Formulario */}
        <main className="w-full max-w-3xl mx-auto relative z-20 -mt-24 md:-mt-32">
          <FormularioRegistro />
        </main>
      </div>
    </div>
  );
}