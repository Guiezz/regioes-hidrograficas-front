"use client";

import Image from "next/image";
import { ZoomIn } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Ampliar imagem: ${alt}`}
          className={cn(
            "group relative block w-full aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
            className
          )}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain p-2"
            unoptimized
          />
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:opacity-100"
          >
            <ZoomIn className="size-4" />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-auto max-w-[95vw] sm:max-w-[95vw] p-3 sm:p-4">
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={1200}
          className="h-auto w-auto max-h-[85vh] max-w-full object-contain"
          unoptimized
        />
        <DialogTitle className="text-sm font-medium text-slate-600">
          {alt}
        </DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
