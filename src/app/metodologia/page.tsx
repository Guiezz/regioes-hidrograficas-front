"use client";

import { useEffect, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import Image from "next/image";
import { getSections } from "@/services/api";
import {
  Loader2,
  MapPin,
  ImageIcon,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Section {
  id: number;
  number: string;
  title: string;
  content: string;
  level: number;
  image?: string;
}

export default function MetodologiaPage() {
  const { selectedReservoir } = useReservoir();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedReservoir) return;

      setLoading(true);
      try {
        const data = await getSections(selectedReservoir.id);

        const metodologiaSections = data
          .filter((s: Section) => s.number.startsWith("2"))
          .sort((a: Section, b: Section) =>
            a.number.localeCompare(b.number, undefined, { numeric: true }),
          );

        setSections(metodologiaSections);
      } catch (error) {
        console.error("Erro ao carregar textos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedReservoir]);

  // Função para pegar apenas o primeiro parágrafo
  const getFirstParagraph = (text: string) => {
    if (!text) return "";
    const paragraphs = text.split("\n").filter((p) => p.trim() !== "");
    return paragraphs[0] || "";
  };

  // Pega um resumo inteligente (se a fase principal não tiver texto, pega da primeira subseção)
  const getSmartSummary = (mainSection: Section, subSections: Section[]) => {
    if (mainSection.content?.trim()) {
      return getFirstParagraph(mainSection.content);
    }
    if (subSections.length > 0 && subSections[0].content?.trim()) {
      return getFirstParagraph(subSections[0].content);
    }
    return "Detalhes das atividades e processos realizados nesta etapa.";
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
          <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">
            Processando Metodologia
          </span>
        </div>
      </div>
    );
  }

  // Separação Nível 1 (Título Principal)
  const mainTitle = sections.find((s) => s.level === 1);

  // Agrupamento: Pega apenas as seções Nível 2 (Fases Principais)
  const level2Sections = sections.filter((s) => s.level === 2);

  return (
    <div className="min-h-screen bg-white selection:bg-sky-100 selection:text-sky-900 pb-24">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-sky-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">
                  Processo de Trabalho
                </span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                  Metodologia Aplicada
                </h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium bg-slate-100 w-fit px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 text-sky-500" />
                  <span className="text-sm tracking-wide">
                    {selectedReservoir?.name
                      ? `Região Hidrográfica do ${selectedReservoir.name}`
                      : "Carregando..."}
                  </span>
                </div>
              </div>

              {mainTitle?.content && (
                <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed text-justify">
                  {getFirstParagraph(mainTitle.content)}
                </p>
              )}
            </div>

            {/* Imagem Hero Mockada */}
            {/* Imagem Hero Real ou Mockada */}
            {mainTitle?.image ? (
              <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 group shadow-sm">
                <Image
                  src={getImageUrl(mainTitle.image)}
                  alt={mainTitle.title || "Metodologia Aplicada"}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  unoptimized
                />
              </div>
            ) : (
              <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 flex flex-col items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 to-transparent" />
                <ImageIcon className="w-16 h-16 text-slate-300 mb-4 group-hover:scale-110 transition-transform duration-500" />
                <span className="text-slate-400 font-medium text-sm tracking-wide">
                  Mockup da Aplicação Geral
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Intercalado (Zig-Zag) */}
      <div className="max-w-5xl mx-auto px-6 mt-20 space-y-32">
        {level2Sections.map((mainSection, index) => {
          const isEven = index % 2 === 0;
          const hasRealImage = !!mainSection.image;

          // Busca todas as subseções que pertencem a este Nível 2 (ex: tudo que começa com "2.1.")
          const subSections = sections.filter(
            (s) => s.level > 2 && s.number.startsWith(`${mainSection.number}.`),
          );

          return (
            <section
              key={mainSection.id}
              className={`flex flex-col gap-12 lg:gap-20 items-center ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Bloco de Imagem */}
              <div className="w-full lg:w-1/2 relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex flex-col items-center justify-center group relative">
                  {hasRealImage ? (
                    <Image
                      src={getImageUrl(mainSection.image!)}
                      alt={mainSection.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-200/50" />
                      <ImageIcon className="w-12 h-12 text-slate-300 mb-3 z-10" />
                      <span className="text-slate-400 font-medium text-sm z-10">
                        Espaço para Foto - {mainSection.title}
                      </span>
                    </>
                  )}

                  {/* Etiqueta flutuante na imagem */}
                  <div
                    className={`absolute top-6 ${isEven ? "left-6" : "right-6"} z-20`}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white shadow-sm border-slate-200"
                    >
                      Fase {mainSection.number}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bloco de Texto */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-tight">
                    {mainSection.title}
                  </h2>
                  <div className="w-12 h-1 bg-sky-500 rounded-full" />
                </div>

                <div className="prose prose-slate prose-lg">
                  <p className="text-slate-600 leading-[1.8] font-light text-[1.1rem] text-justify">
                    {getSmartSummary(mainSection, subSections)}
                  </p>
                </div>

                {/* Lista de Subseções (Highlights) */}
                {subSections.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                      Atividades Chave:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subSections.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md text-sm text-slate-600 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-sky-500" />
                          <span>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal (Dialog) para ler o texto completo hierarquizado */}
                <div className="pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2 text-sky-600 border-sky-200 hover:bg-sky-50 hover:text-sky-700 rounded-full px-6 transition-all duration-300"
                      >
                        <BookOpen className="w-4 h-4" />
                        Ver detalhes da fase
                      </Button>
                    </DialogTrigger>
                    <DialogContent className=" w-2xl md:max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl p-8 md:p-12">
                      <DialogHeader className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge
                            variant="outline"
                            className="text-sky-600 border-sky-200 bg-sky-50"
                          >
                            Fase {mainSection.number}
                          </Badge>
                        </div>
                        <DialogTitle className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                          {mainSection.title}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-8">
                        {/* Texto da seção principal (se existir) */}
                        {mainSection.content && (
                          <div className="text-slate-600 text-justify leading-[1.8] text-[1.1rem] font-light whitespace-pre-line">
                            {mainSection.content}
                          </div>
                        )}

                        {/* Textos das subseções */}
                        {subSections.map((sub) => (
                          <div
                            key={sub.id}
                            className="space-y-3 pt-4 border-t border-slate-100"
                          >
                            <h4 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                              {sub.title}
                            </h4>
                            {sub.content && (
                              <div className="text-slate-600 text-justify leading-[1.8] text-[1.05rem] font-light whitespace-pre-line">
                                {sub.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
