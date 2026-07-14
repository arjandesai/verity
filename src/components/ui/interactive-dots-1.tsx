import * as React from "react";
import { useEffect, useRef } from "react";

interface InteractiveDotsProps {
  dotColor?: string;
  dotSize?: number;
  spacing?: number;
  repelRadius?: number;
  className?: string;
}

/** A full-bleed canvas grid of dots that push away from the cursor within a radius and
    spring back to their resting spot when the mouse moves away - a lightweight "magnetic
    field" effect, redrawn every animation frame. Sizes itself to its parent container. */
export function InteractiveDots({
  dotColor = "#2f6fed",
  dotSize = 3,
  spacing = 34,
  repelRadius = 110,
  className,
}: InteractiveDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dots: { baseX: number; baseY: number; x: number; y: number }[] = [];
    let raf = 0;

    function buildGrid() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);

      dots = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          dots.push({ baseX: x, baseY: y, x, y });
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onMouseLeave() {
      mouse.current = null;
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      for (const dot of dots) {
        let targetX = dot.baseX;
        let targetY = dot.baseY;
        if (mouse.current) {
          const dx = dot.baseX - mouse.current.x;
          const dy = dot.baseY - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < repelRadius) {
            const force = (1 - dist / repelRadius) * 18;
            const angle = Math.atan2(dy, dx);
            targetX = dot.baseX + Math.cos(angle) * force;
            targetY = dot.baseY + Math.sin(angle) * force;
          }
        }
        dot.x += (targetX - dot.x) * 0.18;
        dot.y += (targetY - dot.y) * 0.18;

        const distFromMouse = mouse.current
          ? Math.hypot(dot.baseX - mouse.current.x, dot.baseY - mouse.current.y)
          : Infinity;
        const lit = distFromMouse < repelRadius;
        const r = lit ? dotSize * (1 + (1 - distFromMouse / repelRadius) * 0.8) : dotSize;

        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = dotColor;
        ctx!.globalAlpha = lit ? 0.9 : 0.35;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    buildGrid();
    tick();

    const resizeObserver = new ResizeObserver(buildGrid);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [dotColor, dotSize, spacing, repelRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
