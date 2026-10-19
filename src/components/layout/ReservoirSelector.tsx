"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useReservoir } from "@/context/ReservoirContext";

interface ReservoirSelectorProps {
  fullWidth?: boolean;
}

export function ReservoirSelector({
  fullWidth = false,
}: ReservoirSelectorProps) {
  const {
    reservoirs,
    selectedReservoir,
    setSelectedReservoir,
    isLoading,
    loadError,
    retryReservoirs,
  } = useReservoir();

  if (isLoading) {
    return (
      <div
        className={
          fullWidth
            ? "w-full h-11 bg-muted animate-pulse rounded-md"
            : "w-full h-10 bg-muted animate-pulse rounded-md"
        }
      />
    );
  }

  if (loadError) {
    return (
      <div
        className={`flex gap-2 text-destructive ${
          fullWidth
            ? "items-center text-sm"
            : "flex-col items-start gap-0.5 text-xs leading-tight"
        }`}
      >
        <span className="whitespace-nowrap">
          Não foi possível carregar as regiões.
        </span>
        <Button
          variant="outline"
          size="sm"
          className={`shrink-0 whitespace-nowrap ${fullWidth ? "" : "h-6 px-2 text-xs"}`}
          onClick={retryReservoirs}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={selectedReservoir ? selectedReservoir.id.toString() : ""}
      onValueChange={(value) => {
        const reservoir = reservoirs.find((r) => r.id.toString() === value);
        if (reservoir) {
          setSelectedReservoir(reservoir);
        }
      }}
    >
      <SelectTrigger
        className={
          fullWidth
            ? `w-full h-11 text-base bg-background/80 backdrop-blur-sm transition-all ${
                !selectedReservoir
                  ? "border-[#005384] ring-2 ring-[#0094e0]/20 shadow-xs text-slate-700 font-medium"
                  : "border-primary/20 text-slate-900 font-semibold"
              }`
            : `w-full h-10 bg-background/50 backdrop-blur-sm transition-all ${
                !selectedReservoir
                  ? "border-[#005384] ring-2 ring-[#0094e0]/20 text-slate-600 font-medium"
                  : "border-primary/20 text-slate-900 font-semibold"
              }`
        }
      >
        <SelectValue
          placeholder={
            fullWidth
              ? "Selecione uma região hidrográfica..."
              : "Selecione uma região..."
          }
        />
      </SelectTrigger>
      <SelectContent>
        {reservoirs.map((reservoir) => (
          <SelectItem key={reservoir.id} value={reservoir.id.toString()}>
            {reservoir.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
