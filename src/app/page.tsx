"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { RegionPicker } from "@/components/home/RegionPicker";

export default function HomePage() {
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

        <div className="relative flex flex-col gap-8 px-6 py-10 lg:px-12 lg:py-14 max-w-7xl mx-auto">
          {/* Título, descrição e dica */}
          <div className="min-w-0 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[#005384] via-[#0077b6] to-[#0094e0] bg-clip-text text-transparent">
                Sistema de Informações de Gestão
              </span>{" "}
              <span className="text-[#005384]">
                das Regiões Hidrográficas do Ceará
              </span>
            </h1>
            <p className="text-base md:text-lg text-[#1e3a5f] font-normal leading-relaxed text-justify [hyphens:auto] max-w-3xl">
              Plataforma integrada de inteligência e governança hídrica voltada ao
              diagnóstico situacional, planejamento estratégico e suporte à tomada de
              decisão sobre as 11 regiões hidrográficas do Estado do Ceará.
            </p>
            <p className="text-sm text-[#2b5278]">
              Escolha uma região no mapa para carregar o diagnóstico, os planos e
              os custos dela.
            </p>
          </div>

          {/* Mapa interativo */}
          <div className="min-w-0 animate-in fade-in duration-1000 fill-mode-both [--tw-animation-delay:200ms]">
            <RegionPicker />
          </div>

          <Link
            href="/metodologia"
            className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-[#005384] hover:text-[#0094e0] transition-colors"
          >
            Conhecer a metodologia
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── SEÇÃO DE FUNCIONALIDADES DO SISTEMA (7 módulos ativos) ─── */}
      <section className="py-12 lg:py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-[#005384]">
            Funcionalidades do Sistema
          </h2>
          <p className="text-[#2b5278] text-justify [hyphens:auto] max-w-lg">
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
          <CardDescription className="text-sm leading-relaxed text-justify [hyphens:auto] text-[#2b5278]">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
