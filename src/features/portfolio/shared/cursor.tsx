"use client";

import React, { useEffect, useRef } from "react";

const EXPANDED_CLASSES =
  "-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out h-11 w-11 border border-white/50 bg-white/10 backdrop-blur-[1px]";
const DEFAULT_CLASSES =
  "-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out h-2 w-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]";

export function CinemaCursor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Disable completely on touch devices or if reduced motion is preferred
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let isVisible = false;
    let isExpanded = false;
    let rafId: number | null = null;

    const renderCursor = () => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        containerRef.current.style.opacity = isVisible ? "1" : "0";
      }
      if (dotRef.current) {
        dotRef.current.className = isExpanded ? EXPANDED_CLASSES : DEFAULT_CLASSES;
      }
      rafId = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isVisible = true;

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactiveElement = target.closest(
          'a, button, [role="button"], input, select, textarea, [data-cursor="expand"], [data-testid*="player"], [data-testid*="card"], [data-testid*="poster"]'
        );
        isExpanded = Boolean(interactiveElement);
      }

      if (rafId === null) {
        rafId = requestAnimationFrame(renderCursor);
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (rafId === null) {
        rafId = requestAnimationFrame(renderCursor);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 transition-opacity duration-150 ease-out opacity-0"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    >
      <div
        ref={dotRef}
        className={DEFAULT_CLASSES}
      />
    </div>
  );
}
