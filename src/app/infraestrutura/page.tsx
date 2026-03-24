"use client";

import { useEffect, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import Image from "next/image";
import { getSections } from "@/services/api";
import { Loader2, MapPin } from "lucide-react";

interface Section {
  id: number;
  number: string;
  title: string;
  content: string;
  level: number;
  image?: string;
}

export default function InfraestruturaPage() {
  const { selectedReservoir } = useReservoir();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedReservoir) return;

      setLoading(true);
      try {
        const data = await getSections(selectedReservoir.id);

        const infraSections = data
          .filter((s: Section) => s.number.startsWith("3"))
          .sort((a: Section, b: Section) =>
            a.number.localeCompare(b.number, undefined, { numeric: true }),
          );
        setSections(infraSections);
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
        className="mb-6 text-slate-600 leading-[1.8] text-[1.1rem] font-light text-justify [hyphens:auto]"
      >
        {line}
      </p>
    ));
  };

  const getImageUrl = (imageName: string) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
      "http://localhost:8080";
    return `${baseUrl}/assets/${imageName}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase italic">
            Carregando Infraestrutura
          </span>
        </div>
      </div>
    );
  }

  const mainTitle = sections.find((s) => s.level === 1);
  const subSections = sections.filter((s) => s.level === 2);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-32">
        {/* Header Editorial - Azul Sutil */}
        <header className="mb-20 space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-sky-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">
              Diagnóstico de Infraestrutura
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
              Infraestrutura Hídrica
            </h1>
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm tracking-wide">
                {/* 5. Nome dinâmico */}
                {selectedReservoir?.name
                  ? `Região Hidrográfica do ${selectedReservoir.name}`
                  : "Carregando..."}
              </span>
            </div>
          </div>

          {mainTitle?.content && (
            <div className="max-w-4xl text-xl md:text-2xl text-slate-500 font-light text-justify leading-relaxed">
              {renderContent(mainTitle.content)}
            </div>
          )}
        </header>

        {/* Listagem de Seções */}
        <div className="space-y-3">
          {subSections.map((section) => {
            const children = sections.filter(
              (s) => s.level === 3 && s.number.startsWith(section.number),
            );

            return (
              <article key={section.id} className="relative">
                <div className="flex flex-col gap-4">
                  {/* Título com Identidade Azul */}
                  <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                      {section.title}
                    </h2>
                  </div>

                  {/* Imagem Editorial */}
                  {section.image && (
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                      <Image
                        src={getImageUrl(section.image)}
                        alt={section.title}
                        width={1200}
                        height={600}
                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                        unoptimized
                      />
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-black/40 to-transparent">
                        <p className="text-[10px] text-white font-bold uppercase tracking-widest">
                          Vista Técnica
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Texto Justificado */}
                  <div className="max-w-none">
                    {renderContent(section.content)}
                  </div>

                  {/* Sub-itens (Nível 3) em Grid Azulado */}
                  {children.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="p-8 rounded-2xl bg-blue-50/30 border border-blue-100/50 transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-100/40"
                        >
                          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            {child.title}
                          </h4>
                          <div className="text-slate-600 text-[1rem] font-light leading-relaxed text-justify [hyphens:auto]">
                            {renderContent(child.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400"></p>
        </footer>
      </div>
    </div>
  );
}
