"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReservoir } from "@/context/ReservoirContext";
import { getSections } from "@/services/api";
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
  MapPin,
  Loader2,
} from "lucide-react";
import { ReservoirSelector } from "@/components/layout/ReservoirSelector";

interface BasinMapInfo {
  url: string;
  title: string;
  number: string;
}

function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "";
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
    "http://localhost:8080";
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
}

export default function HomePage() {
  const { selectedReservoir } = useReservoir();
  const [selectedMapType, setSelectedMapType] = useState<"1.2" | "1.3">("1.2");
  const [map12, setMap12] = useState<BasinMapInfo | null>(null);
  const [map13, setMap13] = useState<BasinMapInfo | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBasinMaps() {
      if (!selectedReservoir?.id) return;
      setIsLoadingMap(true);
      try {
        const sections = await getSections(selectedReservoir.id);
        const sec12 = sections.find(
          (s: { number: string; image?: string; title: string }) =>
            s.number === "1.2" && s.image,
        );
        const sec13 = sections.find(
          (s: { number: string; image?: string; title: string }) =>
            s.number === "1.3" && s.image,
        );

        setMap12(
          sec12
            ? {
                url: getImageUrl(sec12.image),
                title: sec12.title,
                number: sec12.number,
              }
            : null,
        );
        setMap13(
          sec13
            ? {
                url: getImageUrl(sec13.image),
                title: sec13.title,
                number: sec13.number,
              }
            : null,
        );
      } catch (err) {
        console.error("Erro ao carregar mapas da identificação:", err);
      } finally {
        setIsLoadingMap(false);
      }
    }
    fetchBasinMaps();
  }, [selectedReservoir?.id]);

  const activeMap = selectedMapType === "1.3" && map13 ? map13 : map12 || map13;

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

          {/* Coluna da Direita - Card com Mapa Oficial de Identificação da API */}
          <div className="flex-1 w-full lg:max-w-md xl:max-w-xl flex justify-center items-center animate-in fade-in duration-1000 fill-mode-both [--tw-animation-delay:200ms]">
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#005384]/20 bg-white shadow-xl shadow-blue-900/10 group flex flex-col">
              {/* Barra Superior do Card */}
              <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#005384]/10 text-[#005384] border border-[#005384]/20">
                  <MapPin className="h-3 w-3 text-[#005384]" />
                  {selectedReservoir?.name
                    ? `Região ${selectedReservoir.name}`
                    : "Região Hidrográfica"}
                </span>

                {/* Seletores de Mapa: Caracterização (1.2) vs Infraestrutura (1.3) */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedMapType("1.2")}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                      selectedMapType === "1.2"
                        ? "bg-[#005384] text-white shadow-xs"
                        : "text-[#2b5278] hover:text-[#005384] hover:bg-slate-50"
                    }`}
                  >
                    Caracterização
                  </button>
                  {map13 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMapType("1.3")}
                      className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                        selectedMapType === "1.3"
                          ? "bg-[#005384] text-white shadow-xs"
                          : "text-[#2b5278] hover:text-[#005384] hover:bg-slate-50"
                      }`}
                    >
                      Infraestrutura
                    </button>
                  )}
                </div>
              </div>

              {/* Área da Imagem / Mapa */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                {isLoadingMap ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-[#005384]" />
                    <span className="text-xs font-medium">Carregando mapa técnico...</span>
                  </div>
                ) : activeMap?.url ? (
                  <Image
                    key={activeMap.url}
                    src={activeMap.url}
                    alt={activeMap.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px"
                    className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Droplets className="h-8 w-8 text-[#005384]/40" />
                    <span className="text-xs">Mapa não disponível</span>
                  </div>
                )}
              </div>

              {/* Rodapé Informativo com Link para Identificação */}
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-[#005384] leading-tight">
                    {activeMap?.title || "Mapa da Região Hidrográfica"}
                  </p>
                  <p className="text-xs text-[#2b5278]/80">
                    {selectedReservoir?.name
                      ? `Bacia Hidrográfica do ${selectedReservoir.name} • Acervo SIGRH`
                      : "Dados biofísicos e cartográficos oficiais"}
                  </p>
                </div>
                <Link
                  href={
                    selectedReservoir?.id
                      ? `/identificacao?basin_id=${selectedReservoir.id}`
                      : "/identificacao"
                  }
                  className="shrink-0 text-xs font-semibold text-[#005384] hover:text-[#0094e0] inline-flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-md hover:bg-blue-50"
                  title="Ver seção completa de Identificação"
                >
                  Identificação
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
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
