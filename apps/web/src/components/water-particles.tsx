"use client";

import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  phase: number;
}

/**
 * Subtle warm-tone floating dots.
 * Replaces the old cyan particle network.
 */
export function WaterParticles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 30;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const warmColors = [
      "rgba(15, 118, 110, ALPHA)", // teal
      "rgba(168, 162, 158, ALPHA)", // stone-400
      "rgba(214, 211, 209, ALPHA)", // stone-300
      "rgba(209, 150, 107, ALPHA)", // terra
    ];

    dotsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      radius: Math.random() * 3 + 1,
      opacity: Math.random() * 0.15 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const draw = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      time += 0.003;

      for (let i = 0; i < dotsRef.current.length; i++) {
        const d = dotsRef.current[i];

        d.x += d.vx + Math.sin(time + d.phase) * 0.08;
        d.y += d.vy + Math.cos(time * 0.7 + d.phase) * 0.06;

        if (d.x < -10) d.x = cw + 10;
        if (d.x > cw + 10) d.x = -10;
        if (d.y < -10) d.y = ch + 10;
        if (d.y > ch + 10) d.y = -10;

        const breathe = Math.sin(time * 1.5 + d.phase) * 0.2 + 0.8;
        const colorTemplate = warmColors[i % warmColors.length];
        const fillColor = colorTemplate.replace(
          "ALPHA",
          String(d.opacity * breathe)
        );

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * breathe, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className || ""}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
