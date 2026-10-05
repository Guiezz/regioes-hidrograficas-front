"use client";

import Image from "next/image";
import Link from "next/link";
import { useReservoir } from "@/context/ReservoirContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ListChecks,
  Layers,
  Coins,
  ShieldCheck,
  FileText,
  Scale,
  Droplets,
  ArrowRight,
} from "lucide-react";
import { ReservoirSelector } from "@/components/layout/ReservoirSelector";

interface BasinPhotoInfo {
  image: string;
  reservoirName: string;
}

const BASIN_PHOTOS: Record<string, BasinPhotoInfo> = {
  "alto jaguaribe": {
    image: "/images/reservatorios/vista_trussu.jpeg",
    reservoirName: "Açude Trussu",
  },
  "baixo jaguaribe": {
    image: "/images/reservatorios/vista_castro.jpg",
    reservoirName: "Açude Castanhão / Vale",
  },
  "banabuiu": {
    image: "/images/reservatorios/vista_fogareiro.jpg",
    reservoirName: "Açude Fogareiro",
  },
  "crateus": {
    image: "/images/reservatorios/vista_carnaubal.jpg",
    reservoirName: "Açude Carnaubal",
  },
  "coreau": {
    image: "/images/reservatorios/vista_missi.jpeg",
    reservoirName: "Açude Missi",
  },
  "curu": {
    image: "/images/reservatorios/vista_tejuçuoca.jpg",
    reservoirName: "Açude Tejuçuoca",
  },
  "ibiapaba": {
    image: "/images/reservatorios/vista_jaburu.jpg",
    reservoirName: "Açude Jaburu I",
  },
  "litoral": {
    image: "/images/reservatorios/vsita_acarape.jpeg",
    reservoirName: "Açude Acarape do Meio",
  },
  "medio jaguaribe": {
    image: "/images/reservatorios/vista_ubaldinho.jpg",
    reservoirName: "Açude Ubaldinho",
  },
  "metropolitana": {
    image: "/images/reservatorios/vista_pesqueiro.jpeg",
    reservoirName: "Sistemas Metropolitanos / Pesqueiro",
  },
  "salgado": {
    image: "/images/reservatorios/vista_cachoeira.jpg",
    reservoirName: "Açude Cachoeira",
  },
};

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getBasinPhoto(name?: string): BasinPhotoInfo {
  if (!name) {
    return {
      image: "/images/reservatorios/hero_acude.jpg",
      reservoirName: "Monitoramento e Segurança Hídrica",
    };
  }
  const norm = normalizeKey(name);
  for (const [key, val] of Object.entries(BASIN_PHOTOS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return val;
    }
  }
  return {
    image: "/images/reservatorios/hero_acude.jpg",
    reservoirName: "Monitoramento e Segurança Hídrica",
  };
}

export default function HomePage() {
  const { selectedReservoir } = useReservoir();
  const basinPhoto = getBasinPhoto(selectedReservoir?.name);

  return (
    <main className="flex flex-col bg-background">
      {/* ─── HERO SECTION ─── */}
      <section
        className="relative overflow-hidden border-b border-border/40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[2%] via-transparent to-primary/[1%] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center gap-10 px-6 py-10 lg:px-12 lg:py-14 max-w-7xl mx-auto">
          {/* Coluna da Esquerda */}
          <div className="flex-1 space-y-6">
            {/* Título */}
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-[#005384] via-[#0077b6] to-[#0094e0] bg-clip-text text-transparent">
                  Sistema de Informações de Gestão
                </span>{" "}
                <span className="text-[#005384]">
                  das Regiões Hidrográficas do Ceará
                </span>
              </h1>
            </div>

            {/* Descrição institucional */}
            <p className="text-base md:text-lg text-[#1e3a5f] font-normal leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both [--tw-animation-delay:100ms]">
              Plataforma integrada de inteligência e governança hídrica voltada ao
              diagnóstico situacional, planejamento estratégico e suporte à tomada de
              decisão sobre as 11 regiões hidrográficas do Estado do Ceará.
            </p>

            {/* Bloco de Seleção (Glass card) */}
            <div className="bg-card/70 backdrop-blur-sm border border-border/40 rounded-xl p-6 shadow-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both [--tw-animation-delay:150ms]">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  Qual região hidrográfica você deseja analisar?
                </h3>
                <p className="text-sm text-[#2b5278]">
                  Selecione para navegar diretamente aos dados analíticos da região.
                </p>
              </div>
              <div className="pt-3">
                <ReservoirSelector fullWidth />
              </div>
            </div>

            {/* Ações (CTAs) */}
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both [--tw-animation-delay:300ms]">
              <Button
                size="lg"
                asChild
                className="gap-2 w-full sm:w-auto group bg-[#005384] hover:bg-[#004168] text-white shadow-lg shadow-blue-900/25"
              >
                <Link href="/situacao-hidrica">
                  Acessar Situação Hídrica
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-[#005384]/30 text-[#005384] hover:bg-[#005384]/10 hover:text-[#004168]"
              >
                <Link href="/custos">Ver Previsão de Custos</Link>
              </Button>
            </div>
          </div>

          {/* Coluna da Direita - Card Fotográfico Moderno e Dinâmico */}
          <div className="flex-1 w-full lg:max-w-md xl:max-w-lg flex justify-center items-center animate-in fade-in duration-1000 fill-mode-both [--tw-animation-delay:200ms]">
            <div className="relative w-full rounded-2xl overflow-hidden border border-border/60 bg-card shadow-2xl shadow-primary/10 group">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  key={basinPhoto.image}
                  src={basinPhoto.image}
                  alt={basinPhoto.reservoirName}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

                {/* Badge informativo dinâmico */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/70 text-sky-300 backdrop-blur-md border border-white/10 shadow-sm">
                    <Droplets className="h-3.5 w-3.5 text-sky-400" />
                    {selectedReservoir?.name
                      ? `Região ${selectedReservoir.name}`
                      : "Região Hidrográfica do Ceará"}
                  </span>
                </div>

                {/* Legenda institucional dinâmica no rodapé do card */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-sm font-semibold tracking-tight text-white drop-shadow-sm">
                    {basinPhoto.reservoirName}
                  </p>
                  <p className="text-xs text-slate-200/90 drop-shadow-sm">
                    {selectedReservoir?.name
                      ? `Bacia Hidrográfica do ${selectedReservoir.name}`
                      : "Acompanhamento integrado de infraestruturas e reservatórios"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEÇÃO DE FUNCIONALIDADES DO SISTEMA (7 módulos ativos) ─── */}
      <section className="py-12 lg:py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-[#005384]">
            Funcionalidades do Sistema
          </h2>
          <p className="text-[#2b5278] max-w-lg">
            Módulos integrados para o diagnóstico, planejamento e governança dos recursos hídricos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.href} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ─── FOOTER INSTITUCIONAL ─── */}
      <footer className="py-10 border-t border-border/40 text-center text-xs text-[#48739e]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground tracking-wider uppercase">
              SIGRH — Ceará
            </span>
          </div>
          <p className="text-[#48739e]">
            Sistema de Informações de Gestão das Regiões Hidrográficas
          </p>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: <Activity className="h-5 w-5 text-white" />,
    title: "Situação Hídrica",
    description:
      "Diagnóstico completo de infraestrutura, demandas, ofertas e balanço hídrico das bacias.",
    href: "/situacao-hidrica",
  },
  {
    icon: <ListChecks className="h-5 w-5 text-white" />,
    title: "Planos de Ação",
    description:
      "Consulte as ações propostas, programas estruturantes e medidas prioritárias de intervenção.",
    href: "/planos",
  },
  {
    icon: <Layers className="h-5 w-5 text-white" />,
    title: "Matriz de Ação",
    description:
      "Estruturação matricial das iniciativas por eixos estratégicos e atores responsáveis.",
    href: "/matriz",
  },
  {
    icon: <Coins className="h-5 w-5 text-white" />,
    title: "Previsão de Custos",
    description:
      "Estimativas e projeções orçamentárias de investimentos fixos e variáveis por período.",
    href: "/custos",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-white" />,
    title: "Monitoramento",
    description:
      "Acompanhe o status e os marcos temporais de implementação das ações no horizonte até 2050.",
    href: "/monitoramento",
  },
  {
    icon: <FileText className="h-5 w-5 text-white" />,
    title: "Identificação",
    description:
      "Caracterização biofísica, delimitação territorial e perfil socioeconômico das regiões.",
    href: "/identificacao",
  },
  {
    icon: <Scale className="h-5 w-5 text-white" />,
    title: "Metodologia",
    description:
      "Fundamentação teórica, diretrizes normativas e procedimentos metodológicos adotados.",
    href: "/metodologia",
  },
];

function FeatureCard({
  icon,
  title,
  description,
  href,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  index: number;
}) {
  return (
    <Link href={href} className="group">
      <Card
        className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg border-border/60 hover:border-[#005384]/40 hover:shadow-blue-500/10"
        style={{
          animationName: "var(--animate-in,enter)",
          animationDuration: "500ms",
          animationDelay: `${index * 80}ms`,
          animationFillMode: "both",
          animationTimingFunction: "ease",
        }}
      >
        <CardHeader>
          <div className="bg-gradient-to-br from-[#005384] to-[#0094e0] p-3 rounded-xl w-fit mb-2 shadow-sm shadow-blue-500/20">
            {icon}
          </div>
          <CardTitle className="text-[#005384] group-hover:text-[#0094e0] transition-colors text-base font-bold">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm leading-relaxed text-[#2b5278]">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
