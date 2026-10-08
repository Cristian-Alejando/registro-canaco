export default function Hero() {
  return (
    <header className="relative w-full h-[250px] md:h-[350px] bg-[url('/HEADER-APP.jpg')] md:bg-[url('/HEADER-WEB.jpg')] bg-cover bg-center flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 relative z-10 -translate-y-6 md:-translate-y-10">
        <img src="/logo-foro.svg" alt="Logotipo Foro CANACO" className="w-[280px] md:w-[350px] h-auto max-w-[90vw]" />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-2 md:h-3 bg-orange-500"></div>
    </header>
  );
}
