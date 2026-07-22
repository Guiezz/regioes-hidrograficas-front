"use client";

import { useEffect, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import Image from "next/image";
import { getSections } from "@/services/api";
import { Loader2, MapPin, Anchor } from "lucide-react";

interface Section {
  id: number;
  number: string;
  title: string;
  content: string;
  level: number;
  image?: string;
}

export default function IdentificacaoPage() {
  const { selectedReservoir } = useReservoir();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedReservoir) return;

      setLoading(true);
      try {
        const data = await getSections(selectedReservoir.id);

        const sortedData = data
          .filter((s: Section) => s.number.startsWith("1"))
          .sort((a: Section, b: Section) =>
            a.number.localeCompare(b.number, undefined, { numeric: true }),
          );

        setSections(sortedData);
      } catch (error) {
        console.error("Erro ao carregar textos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedReservoir]);

  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <p
        key={index}
        className="mb-8 text-slate-600 leading-[1.8] text-[1.1rem] font-light text-justify [hyphens:auto]"
      >
        {line}
      </p>
    ));
  };

  const getImageUrl = (imagePath: string) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
      "http://localhost:8080";

    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    return `${baseUrl}${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase italic">
            Sincronizando Identificação
          </span>
        </div>
      </div>
    );
  }

  const mainTitle = sections.find((s) => s.level === 1);
  const subSections = sections.filter((s) => s.level > 1);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
        <header className="mb-16 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-sky-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">
              Relatório Técnico
            </span>
          </div>

          <div className="space-y-4">
            <h1                 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
              {mainTitle ? mainTitle.title : "Identificação da Região"}
            </h1>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium italic">
                {selectedReservoir?.name
                  ? `Região Hidrográfica do ${selectedReservoir.name}`
                  : "Carregando..."}
              </span>
            </div>
          </div>

          {mainTitle?.content && (
            <div className="pt-8 border-t border-slate-100">
              <div className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed max-w-2xl text-justify">
                {renderContent(mainTitle.content)}
              </div>
            </div>
          )}
        </header>

        <div className="space-y-5">
          {subSections.map((section) => (
            <article key={section.id} className="relative group">
              <div className="grid grid-cols-1 gap-2.5">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-slate-800 tracking-tight transition-colors group-hover:text-slate-900">
                    {section.title}
                  </h2>
                </div>

                {section.image && (
                  <div className="relative pb-5">
                    <div className="overflow-hidden bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                      <Image
                        src={getImageUrl(section.image)}
                        alt={section.title}
                        width={1200}
                        height={800}
                        className="w-full h-auto grayscale-[0.2] contrast-[1.05] transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-[1.02]"
                        unoptimized
                      />
                    </div>
                    <div className="mt-4 flex items-start gap-3 px-2">
                      <Anchor className="w-4 h-4 text-sky-500 mt-1 shrink-0" />
                      <p className="text-[13px] text-slate-500 leading-snug font-medium italic">
                        Figura - {section.title}. Fonte: Acervo Técnico da
                        Unidade de Gestão Hidrográfica.
                      </p>
                    </div>
                  </div>
                )}

                <div className="max-w-4xl">
                  {renderContent(section.content)}
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400"></p>
        </footer>
      </div>
    </div>
  );
}
