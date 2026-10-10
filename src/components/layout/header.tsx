"use client";

import { usePathname } from "next/navigation";
import { ReservoirSelector } from "@/components/layout/ReservoirSelector";

export function Header() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <div className="flex items-center w-full justify-end gap-3">
      <div className="ml-auto flex items-center gap-2.5 shrink-0">
        <span className="text-xs md:text-sm font-medium text-slate-600 hidden md:inline-block">
          Região:
        </span>
        <div className="w-48 sm:w-56 md:w-64">
          <ReservoirSelector />
        </div>
      </div>
    </div>
  );
}
