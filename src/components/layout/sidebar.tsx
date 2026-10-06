"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useReservoir } from "@/context/ReservoirContext";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Workflow,
  AreaChart,
  TableProperties,
  ClipboardList,
  Activity,
  Coins,
} from "lucide-react";

interface NavigationItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface NavigationGroup {
  title: string | null;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    title: null,
    items: [
      {
        label: "Início",
        icon: Home,
        href: "/",
      },
    ],
  },
  {
    title: "Contexto",
    items: [
      {
        label: "Identificação",
        icon: FileText,
        href: "/identificacao",
      },
      {
        label: "Metodologia",
        icon: Workflow,
        href: "/metodologia",
      },
      {
        label: "Situação Hídrica",
        icon: AreaChart,
        href: "/situacao-hidrica",
      },
    ],
  },
  {
    title: "Planejamento",
    items: [
      {
        label: "Matriz de Ação",
        icon: TableProperties,
        href: "/matriz",
      },
      {
        label: "Planos de Ação",
        icon: ClipboardList,
        href: "/planos",
      },
      {
        label: "Monitoramento",
        icon: Activity,
        href: "/monitoramento",
      },
      {
        label: "Previsão de Custos",
        icon: Coins,
        href: "/custos",
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  isMobile?: boolean;
}

export function Sidebar({
  className,
  collapsed = false,
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { selectedReservoir } = useReservoir();

  const getHref = (href: string) => {
    if (!selectedReservoir) return href;
    return href === "/"
      ? `/?basin_id=${selectedReservoir.id}`
      : `${href}?basin_id=${selectedReservoir.id}`;
  };

  return (
    <aside
      style={{
        background: "linear-gradient(to bottom, #07182d, #092640)",
      }}
      className={cn(
        "flex flex-col h-full text-[#d9e8f7] border-r border-white/10 transition-all duration-300 py-4 px-3 select-none",
        className,
      )}
    >
      {/* ─── MARCA / LOGO NO TOPO ─── */}
      <div className="mb-6 px-1">
        {collapsed && !isMobile ? (
          <Link
            href={getHref("/")}
            className="flex items-center justify-center transition-all group py-1"
            title="SIGRH — Sistema de Informações de Gestão das Regiões Hidrográficas do Ceará"
          >
            <div className="relative h-8 w-12 flex items-center justify-center">
              <Image
                src="/logos/logo-isolada.svg"
                alt="Ícone SIGRH"
                fill
                className="object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
          </Link>
        ) : (
          <Link
            href={getHref("/")}
            className="flex flex-col items-start transition-all group px-2 py-1"
            title="SIGRH — Sistema de Informações de Gestão das Regiões Hidrográficas do Ceará"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-12 shrink-0">
                <Image
                  src="/logos/logo-isolada.svg"
                  alt="Ícone SIGRH"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
              <b className="text-2xl font-bold tracking-tight text-white">
                SIGRH
              </b>
            </div>
            <small className="block text-xs text-[#b8d1ea] font-medium leading-snug mt-2">
              Sistema de Informações de Gestão<br />das Regiões Hidrográficas do Ceará
            </small>
          </Link>
        )}
      </div>

      {/* ─── NAVEGAÇÃO ORGANIZADA EM GRUPOS ─── */}
      <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide">
        {navigationGroups.map((group, gIdx) => (
          <div key={group.title || `group-${gIdx}`} className="space-y-1">
            {group.title && (!collapsed || isMobile) && (
              <div className="text-[10px] uppercase tracking-wider text-[#7692ac] px-3 pt-3 pb-1 font-semibold">
                {group.title}
              </div>
            )}
            {group.title && collapsed && !isMobile && (
              <div className="h-px bg-white/10 mx-2 my-2" />
            )}

            {group.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={getHref(item.href)}
                  className={cn(
                    "text-sm group flex p-2.5 w-full font-medium cursor-pointer rounded-lg transition-all",
                    isActive
                      ? "bg-[#075181] text-white shadow-sm font-semibold"
                      : "text-[#d9e8f7] hover:bg-white/10 hover:text-white",
                    collapsed && !isMobile ? "justify-center" : "justify-start",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive
                          ? "text-white"
                          : "text-[#a2bdd5] group-hover:text-white transition-colors",
                        !collapsed || isMobile ? "mr-3" : "mr-0",
                      )}
                    />
                    {(!collapsed || isMobile) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
