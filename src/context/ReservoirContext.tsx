"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getReservoirs, ReservoirData } from "@/services/api"; // Importe a função criada acima

interface ReservoirContextType {
  selectedReservoir: ReservoirData | null;
  reservoirs: ReservoirData[];
  setSelectedReservoir: (reservoir: ReservoirData | null) => void;
  isLoading: boolean;
}

const ReservoirContext = createContext<ReservoirContextType | undefined>(
  undefined,
);

export function ReservoirProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reservoirs, setReservoirs] = useState<ReservoirData[]>([]);
  const [selectedReservoir, setSelectedReservoirState] =
    useState<ReservoirData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Busca a lista de reservatórios na API ao iniciar
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getReservoirs();
        setReservoirs(data);

        // Lógica de Seleção Inicial baseada na URL
        const urlId = searchParams.get("basin_id");

        if (urlId && data.length > 0) {
          // Se tem ID na URL, tenta encontrar na lista
          const found = data.find((r) => r.id.toString() === urlId);
          if (found) {
            setSelectedReservoirState(found);
          } else {
            setSelectedReservoirState(null);
          }
        } else {
          // Sem ID na URL: não pré-seleciona, permitindo o usuário escolher
          setSelectedReservoirState(null);
        }
      } catch (error) {
        console.error("Erro ao carregar contexto de reservatórios:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []); // Roda apenas uma vez na montagem

  // 2. Função para atualizar o estado e a URL
  const setSelectedReservoir = (reservoir: ReservoirData | null) => {
    setSelectedReservoirState(reservoir);

    // Atualiza a URL sem recarregar a página (shallow routing)
    const params = new URLSearchParams(searchParams.toString());
    if (reservoir) {
      params.set("basin_id", reservoir.id.toString());
    } else {
      params.delete("basin_id");
    }
    const query = params.toString();
    router.push(query ? `?${query}` : "?", { scroll: false });
  };

  // 3. Efeito para manter a sincronia se o usuário navegar pelo botão "Voltar" do navegador
  useEffect(() => {
    const urlId = searchParams.get("basin_id");
    if (reservoirs.length > 0) {
      if (urlId) {
        const found = reservoirs.find((r) => r.id.toString() === urlId);
        if (found && found.id !== selectedReservoir?.id) {
          setSelectedReservoirState(found);
        }
      }
    }
  }, [searchParams, reservoirs, selectedReservoir]);

  return (
    <ReservoirContext.Provider
      value={{
        selectedReservoir,
        reservoirs,
        setSelectedReservoir,
        isLoading,
      }}
    >
      {children}
    </ReservoirContext.Provider>
  );
}

export function useReservoir() {
  const context = useContext(ReservoirContext);
  if (context === undefined) {
    throw new Error("useReservoir must be used within a ReservoirProvider");
  }
  return context;
}
