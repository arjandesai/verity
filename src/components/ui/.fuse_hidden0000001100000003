"use client";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LogoItem {
  src: string;
  alt: string;
}

interface AnimatedCarouselProps {
  title?: string;
  logos: (string | LogoItem)[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemsPerViewMobile?: number;
  itemsPerViewDesktop?: number;
  logoContainerWidth?: string;
  logoContainerHeight?: string;
  logoImageWidth?: string;
  logoImageHeight?: string;
  className?: string;
}

function LogoTile({ item, containerClass, imgClass }: { item: LogoItem; containerClass: string; imgClass: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={containerClass}>
      {broken ? (
        <span className="text-[11px] font-semibold text-text-soft capitalize text-center px-2 leading-tight">{item.alt}</span>
      ) : (
        <img src={item.src} alt={item.alt} className={imgClass} onError={() => setBroken(true)} />
      )}
    </div>
  );
}

export function AnimatedCarousel({
  title,
  logos,
  autoPlay = true,
  autoPlayInterval = 3500,
  itemsPerViewDesktop = 5,
  itemsPerViewMobile = 3,
  logoContainerWidth = "w-32",
  logoContainerHeight = "h-16",
  logoImageWidth = "w-auto",
  logoImageHeight = "h-8",
  className,
}: AnimatedCarouselProps) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const perView = isDesktop ? itemsPerViewDesktop : itemsPerViewMobile;
  const pageCount = Math.max(1, Math.ceil(logos.length / perView));

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => setPage((p) => (p + 1) % pageCount), autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayInterval, pageCount]);

  const normalized: LogoItem[] = useMemo(
    () =>
      logos.map((l) =>
        typeof l === "string"
          ? { src: l, alt: (l.split("/").pop() || "logo").replace(/\.(svg|png|jpg|jpeg)$/i, "").replace(/-\d+$/, "").replace(/[-_]/g, " ") }
          : l
      ),
    [logos]
  );

  const visible = useMemo(() => {
    const start = (page * perView) % normalized.length;
    const items: LogoItem[] = [];
    for (let i = 0; i < perView; i++) {
      items.push(normalized[(start + i) % normalized.length]);
    }
    return items;
  }, [page, perView, normalized]);

  return (
    <div className={cn("w-full flex flex-col items-center gap-6", className)}>
      {title && <h3 className="text-lg font-bold text-text-soft tracking-wide">{title}</h3>}
      <div className="flex items-center justify-center gap-8 flex-wrap">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className="flex items-center justify-center gap-8 flex-wrap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            {visible.map((item, i) => (
              <LogoTile
                key={item.src + i}
                item={item}
                containerClass={cn("flex items-center justify-center rounded-xl border border-border bg-card", logoContainerWidth, logoContainerHeight)}
                imgClass={cn("object-contain opacity-80 dark:invert dark:brightness-0 dark:contrast-200", logoImageWidth, logoImageHeight)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === page ? 18 : 6, background: i === page ? "var(--blue-deep)" : "var(--border)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
