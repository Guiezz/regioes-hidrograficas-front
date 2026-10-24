"use client";

import { cn } from "@/lib/utils";
import { REGIONS, type RegionKey } from "@/lib/regions";
import {
  DECORATIVE_PATH,
  MAP_VIEWBOX,
  REGION_PATHS,
} from "@/components/home/ceara-map-paths";

interface CearaRegionsMapProps {
  enabledKeys: RegionKey[];
  activeKey: RegionKey | null;
  hoverKey: RegionKey | null;
  onHover: (key: RegionKey | null) => void;
  onSelect: (key: RegionKey) => void;
  disabled?: boolean;
  className?: string;
}

const NEUTRAL_FILL = "#E2E8F0";

export function CearaRegionsMap({
  enabledKeys,
  activeKey,
  hoverKey,
  onHover,
  onSelect,
  disabled = false,
  className,
}: CearaRegionsMapProps) {
  const focusKey = disabled ? null : (hoverKey ?? activeKey);

  return (
    <figure className={cn("w-full", className)}>
      <svg
        viewBox={MAP_VIEWBOX}
        role="img"
        aria-label="Mapa das regiões hidrográficas do Ceará"
        className="block w-full h-auto"
      >
        <path
          d={DECORATIVE_PATH}
          fill="#C9D1DB"
          aria-hidden="true"
          className="pointer-events-none transition-opacity motion-reduce:transition-none"
          opacity={focusKey ? 0.5 : disabled ? 0.5 : 1}
        />
        {REGIONS.map((region) => {
          const enabled = enabledKeys.includes(region.key);
          const isFocus = region.key === focusKey;
          const opacity = disabled
            ? 0.5
            : !enabled
              ? 1
              : focusKey === null || isFocus
                ? 1
                : 0.22;
          return (
            <path
              key={region.key}
              d={REGION_PATHS[region.key]}
              fill={enabled ? region.color : NEUTRAL_FILL}
              stroke="#fff"
              strokeWidth={9}
              strokeLinejoin="round"
              opacity={opacity}
              aria-hidden="true"
              tabIndex={-1}
              className={cn(
                "transition-opacity motion-reduce:transition-none",
                enabled && !disabled ? "cursor-pointer" : "pointer-events-none",
              )}
              onMouseEnter={enabled && !disabled ? () => onHover(region.key) : undefined}
              onMouseLeave={enabled && !disabled ? () => onHover(null) : undefined}
              onClick={enabled && !disabled ? () => onSelect(region.key) : undefined}
            />
          );
        })}
        {focusKey && (
          <path
            d={REGION_PATHS[focusKey]}
            fill="none"
            stroke="#fff"
            strokeWidth={16}
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none"
          />
        )}
      </svg>
      <figcaption className="mt-2 text-center text-xs text-slate-500">
        <span className="lg:hidden">Toque em uma região</span>
        <span className="hidden lg:inline">
          Passe o mouse ou clique em uma região
        </span>
      </figcaption>
    </figure>
  );
}
