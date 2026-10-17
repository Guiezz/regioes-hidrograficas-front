"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export type DataStatus = "loading" | "error" | "empty" | "unavailable" | "ready";

export interface DataStateProps {
  status: DataStatus;
  onRetry?: () => void;
  onClearFilters?: () => void;
  unavailableReason?: string;
  regionName?: string;
  /** Sobrescreve o texto padrão de "error". */
  errorMessage?: string;
  children?: React.ReactNode;
}

export function DataState({
  status,
  onRetry,
  onClearFilters,
  unavailableReason,
  regionName,
  errorMessage,
  children,
}: DataStateProps) {
  if (status === "ready") return <>{children}</>;

  const box =
    "flex min-h-48 w-full flex-col items-center justify-center gap-3 p-6 text-center";

  if (status === "loading") {
    return (
      <div role="status" className={`${box} text-muted-foreground`}>
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <p className="text-sm">Carregando…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className={box}>
        <p className="text-sm text-foreground">
          {errorMessage ?? "Não foi possível carregar os dados desta região."}
        </p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className={box}>
        <p className="text-sm text-foreground">
          Nenhum resultado para estes filtros.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={box}>
      <p className="text-sm text-foreground">
        Este conteúdo ainda não está disponível no sistema para a região{" "}
        {regionName}.
      </p>
      {unavailableReason && (
        <p className="text-sm text-muted-foreground">{unavailableReason}</p>
      )}
    </div>
  );
}
