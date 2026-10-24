"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useReservoir } from "@/context/ReservoirContext";
import { matchRegions, type MatchedRegion, type RegionKey } from "@/lib/regions";
import { CearaRegionsMap } from "@/components/home/CearaRegionsMap";
import { ReservoirSelector } from "@/components/layout/ReservoirSelector";

export function RegionPicker() {
  const {
    reservoirs,
    selectedReservoir,
    setSelectedReservoir,
    isLoading,
    loadError,
  } = useReservoir();
  const [hoverKey, setHoverKey] = useState<RegionKey | null>(null);

  const matched = useMemo(() => matchRegions(reservoirs), [reservoirs]);
  const enabledKeys = useMemo(
    () => matched.filter((r) => r.reservoir).map((r) => r.key),
    [matched],
  );
  const activeKey =
    matched.find(
      (r) => r.reservoir && r.reservoir.id === selectedReservoir?.id,
    )?.key ?? null;
  const inert = isLoading || loadError;

  const select = (region: MatchedRegion) => {
    if (region.reservoir) setSelectedReservoir(region.reservoir);
  };
  const selectByKey = (key: RegionKey) => {
    const region = matched.find((r) => r.key === key);
    if (region) select(region);
  };

  const shownKey = hoverKey ?? activeKey;
  const shown = matched.find((r) => r.key === shownKey) ?? null;
  const active = matched.find((r) => r.key === activeKey) ?? null;

  return (
    <div className="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,1fr)_13rem] xl:grid-cols-[minmax(0,1fr)_15rem]">
      <CearaRegionsMap
        enabledKeys={enabledKeys}
        activeKey={activeKey}
        hoverKey={hoverKey}
        onHover={setHoverKey}
        onSelect={selectByKey}
        disabled={inert}
        className="mx-auto max-w-[22rem] sm:max-w-[26rem] lg:max-w-none"
      />

      <div className="flex flex-col gap-4 lg:flex-col-reverse">
        {inert ? (
          <div className="[&>div]:flex-wrap [&>div>span]:whitespace-normal">
            <ReservoirSelector fullWidth />
          </div>
        ) : (
          <>
            {/* Desktop: lista */}
            <ul className="hidden lg:flex flex-col gap-1">
              {matched.map((region) => {
                const isActive = region.key === activeKey;
                return (
                  <li key={region.key}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      disabled={!region.reservoir}
                      onClick={() => select(region)}
                      onMouseEnter={() => region.reservoir && setHoverKey(region.key)}
                      onMouseLeave={() => setHoverKey(null)}
                      onFocus={() => region.reservoir && setHoverKey(region.key)}
                      onBlur={() => setHoverKey(null)}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0094e0] disabled:cursor-not-allowed disabled:opacity-50 ${
                        isActive
                          ? "bg-[#E4EFFB] font-semibold text-[#005384]"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: region.color }}
                      />
                      {region.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Celular: seletor único */}
            <div className="space-y-2 lg:hidden">
              <label
                htmlFor="region-select"
                className="block text-center text-sm text-slate-600"
              >
                ou escolha pela lista
              </label>
              <select
                id="region-select"
                value={activeKey ?? ""}
                onChange={(e) => selectByKey(e.target.value as RegionKey)}
                className="h-11 w-full rounded-md border border-[#005384] bg-white px-3 text-base font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0094e0]"
              >
                <option value="" disabled>
                  Selecione uma região…
                </option>
                {matched
                  .filter((r) => r.reservoir)
                  .map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        {/* Resultado */}
        {!loadError && (
        <div
          className="flex min-h-32 flex-col justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          aria-live="polite"
        >
          {shown ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {hoverKey && hoverKey !== activeKey
                  ? "Clique para selecionar"
                  : "Região selecionada"}
              </p>
              <p
                className="text-lg font-bold leading-tight"
                style={{ color: "#005384" }}
              >
                {shown.label}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              Escolha uma região para começar
            </p>
          )}
          {active?.reservoir ? (
            <Link
              href={`/identificacao?basin_id=${active.reservoir.id}`}
              className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#005384] px-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-colors hover:bg-[#004168] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0094e0] focus-visible:ring-offset-2"
            >
              Explorar região
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        )}
      </div>
    </div>
  );
}
