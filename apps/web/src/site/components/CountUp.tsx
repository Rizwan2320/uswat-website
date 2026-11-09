"use client";

/* components/CountUp.tsx
   Counts from 1 to `value` on EVERY page load (also on back/forward-cache restores).
   - The server renders the FINAL number (no-JS, SEO, no hydration mismatch).
   - After hydration the effect takes over the element through a ref. The text is set with
     dangerouslySetInnerHTML so React never owns the text node we mutate. Only digits, commas
     and the suffix go in there, never user input.
   - Use inside a Server Component:  <CountUp value={10000} suffix="+" label="Students" />
   - Pair with count-up.css. */

import { useEffect, useLayoutEffect, useRef } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const nf = new Intl.NumberFormat("en-US");
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type Props = {
  value: number;
  suffix?: string;     // plain text such as "+"
  duration?: number;   // ms, default 2000
  label: string;       // announced to screen readers, e.g. "Students"
  className?: string;
};

export default function CountUp({ value, suffix = "", duration = 2000, label, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const finalText = nf.format(value) + suffix;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.removeAttribute("data-pending"); // reveals the number (see count-up.css)

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = finalText;
      return;
    }

    let raf = 0;
    let io: IntersectionObserver | null = null;
    let started = false;

    const show = (n: number) => { el.textContent = nf.format(n) + suffix; };

    const start = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const tick = (now: number) => {                       // elapsed-time based, not setInterval
        const t = Math.min((now - t0) / duration, 1);
        show(t >= 1 ? value : Math.max(1, Math.round(1 + (value - 1) * easeOutCubic(t))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const reset = () => {
      cancelAnimationFrame(raf);
      started = false;
      show(1);
      io?.disconnect();
      io = new IntersectionObserver(
        ([entry]) => { if (entry?.isIntersecting) { io?.disconnect(); start(); } },
        { threshold: 0.4 }
      );
      io.observe(el);                                       // starts at once if already in view
    };

    reset();

    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) reset(); };
    window.addEventListener("pageshow", onPageShow);

    return () => {                                          // Strict Mode runs this in dev too
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener("pageshow", onPageShow);
      el.textContent = finalText;
    };
  }, [value, suffix, duration, finalText]);

  return (
    <>
      <span
        ref={ref}
        className={`count${className ? ` ${className}` : ""}`}
        data-pending=""
        aria-hidden="true"
        style={{ minWidth: `${finalText.length}ch` }}   /* reserves width: no layout jitter */
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: finalText }}
      />
      <span className="visually-hidden">{`${finalText} ${label}`}</span>
    </>
  );
}
