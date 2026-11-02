import Image from "next/image";
import { LogoMark, Wordmark } from "@/components/brand/logo";

// Panel de marca (solo en escritorio, a la izquierda del formulario)
export function BrandPanel() {
return (
    <section className="flex w-full flex-col gap-5 bg-linear-to-br from-brand-dark to-brand px-6 py-8 text-white lg:justify-center lg:overflow-y-auto lg:px-14">
    <div className="flex items-center gap-3">
        {/* Logo sobre el mismo recuadro blanco que tenía la "R", para que se vea sobre el fondo oscuro */}
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
        <LogoMark size={34} />
        </div>
        <div>
        <Wordmark tone="dark" className="block text-lg leading-tight" />
        <p className="text-xs text-white/80">Comunidad educativa conectada</p>
        </div>
    </div>

    <p className="text-xs font-semibold tracking-widest text-teal-200">
        UNA COMUNIDAD, UN MISMO ESPACIO
    </p>

    <h1 className="text-2xl font-light leading-tight xl:text-3xl">
        Conectando toda la comunidad educativa
    </h1>

    <p className="max-w-md text-sm text-white/90">
        Una plataforma para instituciones, docentes, estudiantes y familias.
    </p>

      {/* La imagen ocupa el alto que sobra (hasta 420 px) para que todo entre sin scroll */}
    <div className="min-h-0 flex-1 lg:max-h-[420px]">
        <Image
            src="/imagen/comunidad-educativa.webp"
            alt="Ilustración de docentes, estudiantes, familias y directivos conectados con la escuela"
            width={1200}
            height={700}
            className="h-full w-auto max-w-full rounded-xl object-contain object-left shadow-lg"
        />
    </div>

    <ul className="flex flex-wrap gap-3">
        <li className="rounded-lg border border-white/30 px-3 py-2 text-sm">
            Datos protegidos
        </li>
        <li className="rounded-lg border border-white/30 px-3 py-2 text-sm">
            Comunidad conectada
        </li>
    </ul>
    </section>
);
}