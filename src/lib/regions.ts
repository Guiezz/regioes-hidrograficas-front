import type { ReservoirData } from "@/services/api";

export type RegionKey =
  | "alto-jaguaribe"
  | "banabuiu"
  | "sertoes-de-crateus"
  | "bacias-metropolitanas"
  | "salgado"
  | "coreau"
  | "medio-jaguaribe"
  | "curu"
  | "litoral"
  | "baixo-jaguaribe"
  | "serra-da-ibiapaba";

export interface RegionDef {
  key: RegionKey;
  /** Nome oficial, exibido na home. */
  label: string;
  color: string;
  /** Posição da forma no SVG de origem (1-12, ordem do arquivo). */
  shapeIndex: number;
  /** Nomes normalizados aceitos: o oficial e o nome usado pela API. */
  match: string[];
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^regiao hidrografica (do|da|de)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

const REGION_LIST: RegionDef[] = [
  { key: "alto-jaguaribe", label: "Alto Jaguaribe", color: "#569F4A", shapeIndex: 1, match: ["alto jaguaribe"] },
  { key: "baixo-jaguaribe", label: "Baixo Jaguaribe", color: "#D40000", shapeIndex: 11, match: ["baixo jaguaribe"] },
  { key: "banabuiu", label: "Banabuiú", color: "#784421", shapeIndex: 2, match: ["banabuiu"] },
  { key: "bacias-metropolitanas", label: "Bacias Metropolitanas", color: "#4D4D4D", shapeIndex: 4, match: ["bacias metropolitanas", "metropolitana"] },
  { key: "coreau", label: "Coreaú", color: "#672178", shapeIndex: 7, match: ["coreau"] },
  { key: "curu", label: "Curu", color: "#1187D0", shapeIndex: 9, match: ["curu"] },
  { key: "litoral", label: "Litoral", color: "#FF801A", shapeIndex: 10, match: ["litoral"] },
  { key: "medio-jaguaribe", label: "Médio Jaguaribe", color: "#242868", shapeIndex: 8, match: ["medio jaguaribe"] },
  { key: "salgado", label: "Salgado", color: "#D4AA00", shapeIndex: 6, match: ["salgado"] },
  { key: "sertoes-de-crateus", label: "Sertões de Crateús", color: "#B26B45", shapeIndex: 3, match: ["sertoes de crateus", "crateus"] },
  { key: "serra-da-ibiapaba", label: "Serra da Ibiapaba", color: "#008001", shapeIndex: 12, match: ["serra da ibiapaba", "ibiapaba"] },
];

export const REGIONS: RegionDef[] = [...REGION_LIST].sort((a, b) =>
  a.label.localeCompare(b.label, "pt-BR"),
);

export interface MatchedRegion extends RegionDef {
  reservoir: ReservoirData | null;
}

/** Sempre 11 itens; `reservoir` é null quando a API não traz a região. */
export function matchRegions(api: ReservoirData[]): MatchedRegion[] {
  return REGIONS.map((region) => {
    const found = api.filter((r) => region.match.includes(normalizeName(r.name)));
    if (found.length > 1 && process.env.NODE_ENV !== "production") {
      console.warn(
        `[regions] ${found.length} itens da API casam com "${region.label}"; usando o primeiro.`,
      );
    }
    return { ...region, reservoir: found[0] ?? null };
  });
}
