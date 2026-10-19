"use client";

import { useReservoir } from "@/context/ReservoirContext";
import { getSections } from "@/services/api";
import { useAsyncData } from "@/hooks/use-async-data";
import { DataState } from "@/components/data-state";
import { isChildOf } from "@/lib/sections";
import { MapPin, Anchor } from "lucide-react";
import { SelectRegionPrompt } from "@/components/layout/SelectRegionPrompt";
import { ZoomableImage } from "@/components/zoomable-image";

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

  const regionId = selectedReservoir?.id;

  const { data, status, retry } = useAsyncData<Section[]>(
    regionId
      ? async () => {
          const all: Section[] = await getSections(regionId);
          return all
            .filter((s) => isChildOf(s.number, "1"))
            .sort((a, b) =>
              a.number.localeCompare(b.number, undefined, { numeric: true }),
            );
        }
      : null,
    [regionId],
  );
  const sections: Section[] = status === "ready" && data ? data : [];

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

  if (!selectedReservoir) {
    return <SelectRegionPrompt moduleName="Identificação" />;
  }

  const mainTitle = sections.find((s) => s.level === 1);
  const subSections = sections.filter((s) => s.level > 1);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
        <header className="mb-16 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-sky-500" />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-sky-600">
              Relatório Técnico
            </span>
          </div>

          <div className="space-y-4">
            <h1                 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
              {mainTitle ? mainTitle.title : "Identificação da Região"}
            </h1>
            <div className="flex items-center gap-2 text-slate-500">
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
              <div className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed text-justify">
                {renderContent(mainTitle.content)}
              </div>
            </div>
          )}
        </header>

        {status === "loading" || status === "idle" ? (
          <DataState status="loading" />
        ) : status === "error" ? (
          <DataState status="error" onRetry={retry} />
        ) : sections.length === 0 ? (
          <DataState
            status="unavailable"
            regionName={selectedReservoir.name}
            unavailableReason="O conteúdo do plano desta região para esta página ainda não foi incorporado ao sistema."
          />
        ) : (
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
                  <figure className="pb-5">
                    <ZoomableImage
                      src={getImageUrl(section.image)}
                      alt={section.title}
                    />
                    <figcaption className="mt-4 flex items-start gap-3 px-2">
                      <Anchor className="w-4 h-4 text-sky-500 mt-1 shrink-0" />
                      <p className="text-[13px] text-slate-500 leading-snug font-medium italic">
                        Figura - {section.title}. Fonte: Acervo Técnico da
                        Unidade de Gestão Hidrográfica.
                      </p>
                    </figcaption>
                  </figure>
                )}

                <div>{renderContent(section.content)}</div>
              </div>
            </article>
          ))}
        </div>
        )}

        <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
        </footer>
      </div>
    </div>
  );
}
