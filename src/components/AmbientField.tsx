import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useUI } from "../context/UIContext";

/**
 * THE AMBIENT FIELD — one living background for the whole application.
 *
 * Before this, every page sat on the same red haze, and depth was built from
 * stacked blurred <div>s: each one its own compositor layer, each Atmosphere
 * its own window mousemove listener. Eleven pages had that treatment and
 * sixteen had nothing but the shared block, so the app felt like one flat
 * room however far you walked through it.
 *
 * This is a single DPR-aware canvas mounted once in the Layout, drawn on one
 * requestAnimationFrame, listening to one pointer. It reads the route and
 * gives each channel its own colour and its own motif, so moving from the
 * shop to recovery to the campaign *feels* like moving somewhere — while
 * staying dark enough that nothing competes with the words on top of it.
 *
 * THE RULES IT KEEPS
 *  - It is decoration, so it never costs a visitor anything they can feel:
 *    the loop stops dead when the tab is hidden (no battery burned behind
 *    another window) and the particle count is derived from viewport area,
 *    not a fixed number that is thin on a laptop and brutal on a 4K monitor.
 *  - prefers-reduced-motion paints ONE still frame and stops. Not a slower
 *    animation — a stopped one, which is what the setting actually asks for.
 *  - The fidelity dial the app already owns (visualFidelity) scales density,
 *    so the low setting is genuinely lighter rather than cosmetically so.
 *  - Channel changes cross-fade over ~1.2s. An instant colour swap reads as
 *    a glitch; the fade reads as a room changing its light.
 */

type Motif = "embers" | "rings" | "drift" | "grid" | "bloom" | "pulse";

interface Channel {
  /** rgb triplet — kept as numbers so two channels can be interpolated */
  accent: [number, number, number];
  motif: Motif;
}

const RED: [number, number, number] = [220, 38, 38];

/** Longest prefix wins, so /product/x inherits the shop's light. */
const CHANNELS: [string, Channel][] = [
  ["/stay-safe", { accent: [225, 29, 72], motif: "rings" }],
  ["/nutrients", { accent: [217, 145, 32], motif: "bloom" }],
  ["/recovery", { accent: [56, 152, 190], motif: "drift" }],
  ["/combat", { accent: [234, 88, 12], motif: "pulse" }],
  ["/academy", { accent: [139, 92, 246], motif: "embers" }],
  ["/knowledge-core", { accent: [139, 92, 246], motif: "embers" }],
  ["/analytics", { accent: [16, 185, 129], motif: "grid" }],
  ["/performance-system", { accent: [16, 185, 129], motif: "grid" }],
  ["/protocol-builder", { accent: [16, 185, 129], motif: "grid" }],
  ["/protocol-stacks", { accent: [16, 185, 129], motif: "grid" }],
  ["/shop", { accent: RED, motif: "grid" }],
  ["/product", { accent: RED, motif: "grid" }],
  ["/category", { accent: RED, motif: "grid" }],
  ["/gallery", { accent: RED, motif: "grid" }],
  ["/compare", { accent: RED, motif: "grid" }],
  ["/our-story", { accent: [180, 83, 60], motif: "drift" }],
  ["/manifesto", { accent: [180, 83, 60], motif: "drift" }],
  ["/raw-cares", { accent: [225, 29, 72], motif: "bloom" }],
  ["/checkout", { accent: RED, motif: "drift" }],
  ["/account", { accent: RED, motif: "drift" }],
  ["/contact", { accent: RED, motif: "drift" }],
];

const HOME: Channel = { accent: RED, motif: "embers" };

const channelFor = (path: string): Channel => {
  if (path === "/") return HOME;
  for (const [prefix, ch] of CHANNELS) if (path.startsWith(prefix)) return ch;
  return HOME;
};

interface Mote {
  x: number; y: number;      // 0..1 of the viewport, so a resize never strands one
  vx: number; vy: number;
  r: number;                 // device-independent radius
  a: number;                 // base alpha
  phase: number;             // per-mote offset so nothing pulses in lockstep
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();
  const { visualFidelity } = useUI();

  // The target channel lives in a ref: the draw loop reads it every frame, so
  // a route change must NOT restart the loop (that would reseed every mote and
  // make navigation flicker).
  const target = useRef<Channel>(channelFor(location.pathname));
  const current = useRef<{ accent: [number, number, number]; motif: Motif; blend: number }>({
    accent: [...channelFor(location.pathname).accent] as [number, number, number],
    motif: channelFor(location.pathname).motif,
    blend: 1,
  });

  useEffect(() => {
    const next = channelFor(location.pathname);
    if (next.motif !== current.current.motif || next.accent.join() !== target.current.accent.join()) {
      target.current = next;
      current.current.blend = 0; // start the cross-fade
    }
  }, [location.pathname]);

  const fidelity = useRef(visualFidelity);
  useEffect(() => { fidelity.current = visualFidelity; }, [visualFidelity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1;
    let motes: Mote[] = [];
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const seed = () => {
      // Density from area, scaled by the fidelity dial. A 4K screen gets more
      // motes than a laptop so the field reads the same at both sizes, and the
      // hard ceiling keeps the worst case bounded.
      const budget = Math.round((w * h) / 26000 * (Math.max(25, fidelity.current) / 100));
      const count = Math.min(90, Math.max(14, budget));
      motes = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00012,
        vy: -(0.00004 + Math.random() * 0.00011),
        r: 0.6 + Math.random() * 2.2,
        a: 0.10 + Math.random() * 0.32,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2); // 3x on phones buys nothing here
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = e.clientY / window.innerHeight;
    };

    const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;

    const draw = (t: number) => {
      const cur = current.current;
      const tgt = target.current;

      // Ease the accent toward the route's colour. The motif swaps at the
      // midpoint of the fade, where the field is least legible — so the change
      // of pattern is hidden inside the change of light.
      if (cur.blend < 1) {
        cur.blend = Math.min(1, cur.blend + 0.014);
        const e = cur.blend * cur.blend * (3 - 2 * cur.blend); // smoothstep
        cur.accent = [
          lerp(cur.accent[0], tgt.accent[0], e * 0.12),
          lerp(cur.accent[1], tgt.accent[1], e * 0.12),
          lerp(cur.accent[2], tgt.accent[2], e * 0.12),
        ];
        if (cur.blend > 0.5) cur.motif = tgt.motif;
      }

      const accent = cur.accent;
      const motif = cur.motif;
      const time = t / 1000;

      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;

      ctx.clearRect(0, 0, w, h);

      /* ── The aurora: two slow radial washes, one anchored to the pointer.
            This is what actually lifts a page off flat black. ───────────── */
      const g1 = ctx.createRadialGradient(
        w * (0.22 + Math.sin(time * 0.06) * 0.05 + (pointer.x - 0.5) * 0.06),
        h * (0.18 + Math.cos(time * 0.05) * 0.04 + (pointer.y - 0.5) * 0.05),
        0,
        w * 0.5, h * 0.4, Math.max(w, h) * 0.78,
      );
      g1.addColorStop(0, rgba(accent, 0.085));
      g1.addColorStop(0.45, rgba(accent, 0.022));
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(
        w * (0.82 + Math.cos(time * 0.045) * 0.05),
        h * (0.86 + Math.sin(time * 0.055) * 0.04),
        0,
        w * 0.6, h * 0.7, Math.max(w, h) * 0.62,
      );
      g2.addColorStop(0, rgba(accent, 0.055));
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      /* ── The motif: the part that tells you which room you are in. ───── */
      if (motif === "rings" || motif === "pulse") {
        // Concentric rings — lifted from the product's own packaging art, which
        // is exactly what the campaign pages should be sitting inside.
        const cx = w * (motif === "rings" ? 0.5 : 0.78);
        const cy = h * (motif === "rings" ? 0.42 : 0.5);
        const count = motif === "rings" ? 7 : 5;
        const speed = motif === "pulse" ? 0.5 : 0.22;
        for (let i = 0; i < count; i++) {
          const p = ((time * speed + i / count) % 1);
          const radius = p * Math.max(w, h) * 0.62;
          const fade = Math.sin(p * Math.PI); // born and dies invisible
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(accent, 0.05 * fade);
          ctx.lineWidth = motif === "pulse" ? 1.6 : 1;
          ctx.stroke();
        }
      }

      if (motif === "grid") {
        // A drifting measurement grid: the shop and the data rooms should feel
        // surveyed rather than atmospheric.
        const step = 68;
        const ox = (time * 5 + (pointer.x - 0.5) * 26) % step;
        const oy = (time * 3.5 + (pointer.y - 0.5) * 26) % step;
        ctx.strokeStyle = rgba(accent, 0.035);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = -step + ox; x < w + step; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = -step + oy; y < h + step; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();
      }

      if (motif === "bloom") {
        // Slow overlapping blooms — organic, for the nutrient and care rooms.
        for (let i = 0; i < 3; i++) {
          const p = time * 0.08 + i * 0.37;
          const cx = w * (0.3 + 0.4 * Math.sin(p));
          const cy = h * (0.35 + 0.3 * Math.cos(p * 1.3));
          const r = Math.max(w, h) * (0.12 + 0.05 * Math.sin(p * 2));
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0, rgba(accent, 0.05));
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* ── The motes: present in every motif, moving differently in each. ── */
      const cold = motif === "drift";
      for (const m of motes) {
        m.x += m.vx * (cold ? 0.6 : 1);
        m.y += m.vy * (cold ? 0.5 : 1);
        if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
        if (m.x < -0.05) m.x = 1.05;
        if (m.x > 1.05) m.x = -0.05;

        const twinkle = 0.62 + 0.38 * Math.sin(time * 0.9 + m.phase);
        // Parallax: nearer motes (bigger) move more with the pointer, which is
        // what makes a flat canvas read as depth.
        const px = m.x * w + (pointer.x - 0.5) * m.r * 12;
        const py = m.y * h + (pointer.y - 0.5) * m.r * 12;

        ctx.beginPath();
        ctx.arc(px, py, m.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(accent, m.a * twinkle * 0.5);
        ctx.fill();

        if (m.r > 1.9) {
          const g = ctx.createRadialGradient(px, py, 0, px, py, m.r * 7);
          g.addColorStop(0, rgba(accent, m.a * twinkle * 0.16));
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, m.r * 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    let raf = 0;
    let running = false;

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    if (reduced) {
      draw(0); // one honest still frame, then nothing moves again
    } else {
      start();
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
