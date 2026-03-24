"use client";

import { useEffect, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import Image from "next/image";
import { getSections } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Droplet,
  TrendingUp,
  MapPin,
  ChevronRight,
} from "lucide-react";

interface Section {
  id: number;
  number: string;
  title: string;
  content: string;
  level: number;
  image?: string;
}

export default function DemandasPage() {
  const { selectedReservoir } = useReservoir();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedReservoir) return;

      setLoading(true);
      try {
        const data = await getSections(selectedReservoir.id);

        const demandasSections = data
          .filter((s: Section) => s.number.startsWith("4"))
          .sort((a: Section, b: Section) =>
            a.number.localeCompare(b.number, undefined, { numeric: true }),
          );

        setSections(demandasSections);
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
            Analisando Demandas
          </span>
        </div>
      </div>
    );
  }

  const mainTitle = sections.find((s) => s.level === 1);
  const tabs = sections.filter((s) => s.level === 2);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-32">
        <header className="mb-20 space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-sky-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">
              Diagnóstico da Demanda Hídrica
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
              Demanda Hídrica
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
            <div className="max-w-3xl pt-8 border-t border-slate-100">
              <div className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed text-justify">
                {renderContent(mainTitle.content)}
              </div>
            </div>
          )}
        </header>

        {/* --- Abas Principais (Nível 2) --- */}
        {tabs.length > 0 && (
          <Tabs defaultValue={tabs[0].number} className="w-full space-y-16">
            <div className="sticky top-4 z-20 flex justify-center">
              <TabsList className="bg-slate-100/80 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-sm h-14">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.number}
                    className="rounded-full px-8 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                  >
                    {tab.title.toLowerCase().includes("atual") ? (
                      <Droplet className="w-3.5 h-3.5 mr-2" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5 mr-2" />
                    )}
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabs.map((tab) => {
              const children = sections.filter(
                (s) => s.level === 3 && s.number.startsWith(tab.number),
              );

              return (
                <TabsContent
                  key={tab.id}
                  value={tab.number}
                  className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700"
                >
                  {/* Descrição da Aba */}
                  {tab.content && (
                    <div className="max-w-4xl border-l-2 border-blue-100 pl-4 italic">
                      {renderContent(tab.content)}
                    </div>
                  )}

                  {/* Artigos de Nível 3 */}
                  <div className="space-y-4">
                    {children.map((child) => {
                      const subItems = sections.filter(
                        (s) =>
                          s.level === 4 && s.number.startsWith(child.number),
                      );

                      return (
                        <article key={child.id} className="group">
                          <div className="flex flex-col gap-5">
                            <header className="space-y-4">
                              <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                                {child.title}
                              </h3>
                            </header>

                            {child.image && (
                              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                <Image
                                  src={getImageUrl(child.image)}
                                  alt={child.title}
                                  width={1200}
                                  height={600}
                                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                                  unoptimized
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100">
                                  Projeção de Dados
                                </div>
                              </div>
                            )}

                            <div className="max-w-none">
                              {renderContent(child.content)}
                            </div>

                            {/* Detalhamento (Nível 4) */}
                            {subItems.length > 0 && (
                              <div className="grid grid-cols-1 gap-6 mt-4">
                                {subItems.map((subItem) => (
                                  <div
                                    key={subItem.id}
                                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
                                  >
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-3">
                                      <ChevronRight className="w-4 h-4 text-blue-500" />
                                      {subItem.title}
                                    </h4>
                                    <div className="text-slate-600">
                                      {renderContent(subItem.content)}
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
                </TabsContent>
              );
            })}
          </Tabs>
        )}

        {/* Footer */}
        <footer className="mt-10 pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400"></p>
        </footer>
      </div>
    </div>
  );
}
