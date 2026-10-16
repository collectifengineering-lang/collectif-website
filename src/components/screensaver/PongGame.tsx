"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Press_Start_2P } from "next/font/google";

interface PongGameProps {
  onExit: () => void;
  /** Frozen capture of the viewport. When missing, generated art is used as the "screen". */
  snapshot?: HTMLCanvasElement | null;
}

type Side = "player" | "cpu";

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  spin: number; // sideways acceleration from "english", decays over time
  owner: Side; // last paddle that hit it, gets credit for the glass it breaks
  held: Side | null; // sitting on a paddle waiting to be served
  serveAt: number;
  combo: number; // shards broken since the last paddle hit
  bounces: number; // bumps on every paddle hit, lets the CPU re-aim
  trail: { x: number; y: number }[];
  bomb: { fuse: number; by: Side } | null; // a lit bomb: who sent it and seconds left on the fuse
}

interface Paddle {
  x: number; // center
  y: number; // top
  w: number;
  h: number;
  vx: number; // smoothed velocity in px/s, drives speed and spin of returns
  prevX: number;
  koUntil: number; // blown up by a bomb: gone (no hits) until this game time
}

interface Shockwave {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
}

interface Debris {
  img: HTMLCanvasElement; // the shard, cut out of the frozen screen
  w: number;
  h: number;
  ox: number; // shard centroid inside img
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  life: number;
  maxLife: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface FloatText {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface MatchResult {
  winner: Side | "tie";
  player: number;
  cpu: number;
  playerShards: number;
  cpuShards: number;
  bestCombo: number;
  topSpeed: number;
  kos: number;
}

// 8-bit look. preload: false so the rest of the site never downloads it; it's
// fetched when the game opens.
const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const FONT = pixelFont.style.fontFamily;

const PLAYER_COLOR = "#88D0BA";
const CPU_COLOR = "#6888fc";
const SMASH_COLOR = "#ff2d8a";
const BALL_COLOR = "#ffe600";
const BOMB_COLOR = "#ff7a00";
const GOAL_POINTS = 40;
const KO_POINTS = 60;
const FUSE_SECONDS = 5;
const KO_SECONDS = 3;
// Secret: the Konami code arms a bomb (once per match); on touch, triple-tap your score
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const MAX_DEBRIS = 260;
const MAX_SPARKS = 360;
const DEBRIS_PER_FRAME = 45;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const PongGame = ({ onExit, snapshot }: PongGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onExitRef = useRef(onExit);
  const exitedRef = useRef(false);
  const restartRef = useRef<() => void>(() => {});
  const [result, setResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  const exit = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    onExitRef.current();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.25 : 1;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // The canvas doesn't trigger web-font downloads by itself; ask for the pixel font now
    // (it swaps in on the next frame once loaded)
    document.fonts?.load(`16px ${FONT}`).catch(() => {});

    // Viewport + device pixels
    let W = 0;
    let H = 0;
    let dpr = 1;

    const geo = {
      S: 40, // nominal shard cell size
      sx: 40, // actual cell width/height after fitting the viewport
      sy: 40,
      cols: 0,
      rows: 0,
      ballR: 8,
      pvRef: 1600, // paddle speed that counts as a "full" swipe
      u: 3, // 8-bit pixel size for paddles, markers and effects
      narrow: false,
    };

    // The frozen screen: `source` keeps the untouched capture (shards sample it),
    // `screen` is the same image with holes where the glass broke.
    const source = document.createElement("canvas");
    const screen = document.createElement("canvas");
    const bg = document.createElement("canvas");
    const sourceCtx = source.getContext("2d");
    const screenCtx = screen.getContext("2d");
    const bgCtx = bg.getContext("2d");
    if (!sourceCtx || !screenCtx || !bgCtx) return;

    // Glass mesh: a jittered grid, every cell split into two triangles (shards)
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let tri = new Int32Array(0); // 3 point indices per shard
    let nb = new Int32Array(0); // 3 edge-neighbour shards per shard (-1 = none)
    let cx = new Float32Array(0); // centroids
    let cy = new Float32Array(0);
    let alive = new Uint8Array(0);
    let hp = new Uint8Array(0); // 2 = intact, 1 = cracked
    let hitAt = new Float32Array(0); // last time a ball touched the pane
    let shardColor: string[] = [];
    let total = 1;
    let aliveCount = 1;
    const introEnd = 1.4;
    let introCracked = false;
    let spritesThisFrame = 0;
    let debrisBudget = DEBRIS_PER_FRAME; // raised for one frame by a bomb blast

    const input = {
      pointerX: null as number | null,
      left: false,
      right: false,
      boost: false,
      nudge: 0, // px of keyboard taps not yet applied
      serve: false,
      snap: false,
    };

    const g = {
      phase: "intro" as "intro" | "play" | "over",
      time: 0,
      playTime: 0,
      d: 0, // difficulty 0..1
      level: 1,
      maxLevel: 1,
      balls: [] as Ball[],
      debris: [] as Debris[],
      sparks: [] as Spark[],
      texts: [] as FloatText[],
      shockwaves: [] as Shockwave[],
      player: { x: 0, y: 0, w: 100, h: 12, vx: 0, prevX: 0, koUntil: 0 } as Paddle,
      cpu: { x: 0, y: 0, w: 100, h: 12, vx: 0, prevX: 0, koUntil: 0 } as Paddle,
      score: { player: 0, cpu: 0 },
      shards: { player: 0, cpu: 0 },
      meter: { player: 0, cpu: 0 }, // bomb charge 0..1; full = next hit sends a bomb
      kos: 0, // paddles you blew up
      secretUsed: false,
      bestCombo: 0,
      topSpeed: 0,
      lastSpeed: 0,
      shake: 0,
      hitStop: 0,
      flash: 0,
      flashColor: "#ffffff",
      multiballDone: false,
      collapsing: false,
      crumbleAt: 0,
      overAt: 0,
      resultSent: false,
      nextBallId: 1,
    };

    const ai = {
      reactIn: 0,
      target: 0,
      err: 0,
      key: "",
      aimOff: 0,
      smash: false,
      swipeDir: 1,
      bombPlan: "" as "" | "return" | "dodge", // what to do about an incoming bomb
    };

    const cruiseSpeed = () => H * (0.55 + 0.35 * g.d);
    const smashSpeed = () => H * 1.3;
    const maxSpeed = () => H * 2.3;
    const toKmh = (s: number) => Math.round((s / H) * 100);

    const drawFallbackScreen = (c: CanvasRenderingContext2D) => {
      const grad = c.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#1b2a3a");
      grad.addColorStop(0.5, "#2e5f58");
      grad.addColorStop(1, "#1a1a2e");
      c.fillStyle = grad;
      c.fillRect(0, 0, W, H);
      c.fillStyle = "rgba(255,255,255,0.9)";
      c.font = `${Math.round(Math.min(W, H) * 0.08)}px ${FONT}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("COLLECTIF", W / 2, H / 2);
    };

    const buildField = () => {
      W = Math.max(window.innerWidth, 320);
      H = Math.max(window.innerHeight, 320);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      geo.narrow = W < 560;
      geo.S = clamp(Math.round(Math.min(W, H) / 20), 28, 48);
      geo.cols = Math.ceil(W / geo.S);
      geo.rows = Math.ceil(H / geo.S);
      geo.sx = W / geo.cols;
      geo.sy = H / geo.rows;
      geo.ballR = clamp(Math.min(W, H) * 0.011, 6, 10);
      geo.pvRef = clamp(W * 1.6, 900, 2600);
      geo.u = clamp(Math.round(Math.min(W, H) / 220), 2, 4);

      const lane = clamp(H * 0.22, 120, 210);
      const pw = clamp(W * 0.13, 84, 170);
      const ph = clamp(H * 0.016, 10, 15);
      g.player = { x: W / 2, y: H - Math.max(38, lane * 0.3) - ph, w: pw, h: ph, vx: 0, prevX: W / 2, koUntil: 0 };
      g.cpu = { x: W / 2, y: Math.max(geo.narrow ? 86 : 64, lane * 0.38), w: pw, h: ph, vx: 0, prevX: W / 2, koUntil: 0 };

      // Source + screen layers
      for (const c of [source, screen, bg]) {
        c.width = canvas.width;
        c.height = canvas.height;
      }
      sourceCtx.setTransform(1, 0, 0, 1, 0, 0);
      if (snapshot && snapshot.width > 0 && snapshot.height > 0) {
        sourceCtx.drawImage(snapshot, 0, 0, source.width, source.height);
      } else {
        sourceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawFallbackScreen(sourceCtx);
        sourceCtx.setTransform(1, 0, 0, 1, 0, 0);
      }
      screenCtx.setTransform(1, 0, 0, 1, 0, 0);
      screenCtx.globalCompositeOperation = "source-over";
      screenCtx.clearRect(0, 0, screen.width, screen.height);
      screenCtx.drawImage(source, 0, 0);

      // What's behind the screen: dark void with a faint grid and the classic center line
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bgGrad = bgCtx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      bgGrad.addColorStop(0, "#151824");
      bgGrad.addColorStop(1, "#06070b");
      bgCtx.fillStyle = bgGrad;
      bgCtx.fillRect(0, 0, W, H);
      bgCtx.strokeStyle = "rgba(255,255,255,0.045)";
      bgCtx.lineWidth = 1;
      bgCtx.beginPath();
      for (let x = 0; x <= W; x += 32) {
        bgCtx.moveTo(Math.round(x) + 0.5, 0);
        bgCtx.lineTo(Math.round(x) + 0.5, H);
      }
      for (let y = 0; y <= H; y += 32) {
        bgCtx.moveTo(0, Math.round(y) + 0.5);
        bgCtx.lineTo(W, Math.round(y) + 0.5);
      }
      bgCtx.stroke();
      bgCtx.fillStyle = "rgba(255,255,255,0.18)";
      for (let x = 0; x < W; x += 28) bgCtx.fillRect(x, H / 2 - 2, 14, 4);

      // Glass mesh
      const { cols, rows, sx, sy } = geo;
      const pc = cols + 1;
      px = new Float32Array(pc * (rows + 1));
      py = new Float32Array(pc * (rows + 1));
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const i = r * pc + c;
          const edgeX = c === 0 || c === cols;
          const edgeY = r === 0 || r === rows;
          px[i] = c * sx + (edgeX ? 0 : rand(-0.36, 0.36) * sx);
          py[i] = r * sy + (edgeY ? 0 : rand(-0.36, 0.36) * sy);
        }
      }
      total = cols * rows * 2;
      aliveCount = total;
      tri = new Int32Array(total * 3);
      nb = new Int32Array(total * 3).fill(-1);
      cx = new Float32Array(total);
      cy = new Float32Array(total);
      alive = new Uint8Array(total).fill(1);
      hp = new Uint8Array(total).fill(2);
      hitAt = new Float32Array(total).fill(-10);
      const edges = new Map<number, number>();
      const link = (t: number, slot: number, a: number, b: number) => {
        const key = Math.min(a, b) * 1e6 + Math.max(a, b);
        const other = edges.get(key);
        if (other === undefined) {
          edges.set(key, t * 3 + slot);
          return;
        }
        nb[t * 3 + slot] = Math.floor(other / 3);
        nb[other] = t;
      };
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p00 = r * pc + c;
          const p10 = p00 + 1;
          const p01 = p00 + pc;
          const p11 = p01 + 1;
          const flip = Math.random() < 0.5;
          const shards = flip
            ? [
                [p00, p10, p11],
                [p00, p11, p01],
              ]
            : [
                [p00, p10, p01],
                [p10, p11, p01],
              ];
          for (let k = 0; k < 2; k++) {
            const t = (r * cols + c) * 2 + k;
            const [a, b, d] = shards[k];
            tri[t * 3] = a;
            tri[t * 3 + 1] = b;
            tri[t * 3 + 2] = d;
            cx[t] = (px[a] + px[b] + px[d]) / 3;
            cy[t] = (py[a] + py[b] + py[d]) / 3;
            link(t, 0, a, b);
            link(t, 1, b, d);
            link(t, 2, d, a);
          }
        }
      }

      // Average colour per cell, used for the sparks
      shardColor = new Array(total).fill("#ffffff");
      try {
        const tc = document.createElement("canvas");
        tc.width = cols;
        tc.height = rows;
        const tctx = tc.getContext("2d");
        if (tctx) {
          tctx.drawImage(source, 0, 0, cols, rows);
          const data = tctx.getImageData(0, 0, cols, rows).data;
          for (let t = 0; t < total; t++) {
            const cell = Math.floor(t / 2);
            shardColor[t] = `rgb(${data[cell * 4]},${data[cell * 4 + 1]},${data[cell * 4 + 2]})`;
          }
        }
      } catch {
        // Tainted canvas: sparks stay white
      }
    };

    const makeBall = (holder: Side, serveAt: number): Ball => ({
      id: g.nextBallId++,
      x: W / 2,
      y: H / 2,
      vx: 0,
      vy: 0,
      r: geo.ballR,
      spin: 0,
      owner: holder,
      held: holder,
      serveAt,
      combo: 0,
      bounces: 0,
      trail: [],
      bomb: null,
    });

    const newMatch = () => {
      buildField();
      g.phase = "intro";
      g.time = 0;
      g.playTime = 0;
      g.d = 0;
      g.level = 1;
      g.maxLevel = 1;
      g.debris = [];
      g.sparks = [];
      g.texts = [];
      g.shockwaves = [];
      g.meter = { player: 0, cpu: 0 };
      g.kos = 0;
      g.secretUsed = false;
      g.score = { player: 0, cpu: 0 };
      g.shards = { player: 0, cpu: 0 };
      g.bestCombo = 0;
      g.topSpeed = 0;
      g.lastSpeed = 0;
      g.shake = 0;
      g.hitStop = 0;
      g.flash = 0;
      g.multiballDone = false;
      g.collapsing = false;
      g.crumbleAt = 0;
      g.resultSent = false;
      g.balls = [makeBall("player", introEnd + 0.5), makeBall("cpu", introEnd + rand(0.6, 1.1))];
      introCracked = false;
      ai.reactIn = 0;
      ai.target = W / 2;
      ai.key = "";
      ai.smash = false;
      ai.bombPlan = "";
      input.pointerX = null;
      input.nudge = 0;
      input.snap = true;
    };

    // ---------- effects ----------

    const addText = (text: string, x: number, y: number, color: string, size = 20, life = 1.1) => {
      g.texts.push({ text, x: clamp(x, 80, W - 80), y, life, maxLife: life, color, size });
    };

    const burst = (x: number, y: number, n: number, color: string, power: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = rand(0.3, 1) * power;
        const life = rand(0.3, 0.7);
        g.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, maxLife: life, size: rand(2, 4.5), color });
      }
    };

    // ---------- bomb ----------

    // Bomb meter: smashes, combos, goals and broken glass charge it; when it's full the
    // side's next hit lights a bomb (one bomb in play at a time)
    const charge = (side: Side, amount: number) => {
      if (g.phase !== "play") return;
      const before = g.meter[side];
      // The CPU charges slower, catching up as it levels up
      g.meter[side] = Math.min(1, before + amount * (side === "cpu" ? 0.45 + 0.45 * g.d : 1));
      if (before < 1 && g.meter[side] >= 1) {
        const p = side === "player" ? g.player : g.cpu;
        addText(side === "player" ? "BOMB READY!" : "CPU BOMB READY!", p.x, side === "player" ? p.y - 44 : p.y + 56, BOMB_COLOR, 12, 1.6);
      }
    };

    const secretBomb = () => {
      if (g.secretUsed || g.phase !== "play") return;
      g.secretUsed = true;
      g.meter.player = 1;
      g.flash = 0.4;
      g.flashColor = BOMB_COLOR;
      addText("SECRET BOMB UNLOCKED!", W / 2, H / 2 - 50, BOMB_COLOR, 16, 2);
    };

    // KABOOM: a huge crater, a shockwave, and any paddle caught in it is knocked out.
    // `direct` is the paddle the bomb hit; `nearKO` also KOs paddles close to the blast.
    const explode = (b: Ball, x: number, y: number, direct: Side | null, nearKO: boolean, resetBall: boolean) => {
      const by: Side = b.bomb ? b.bomb.by : b.owner;
      b.bomb = null;
      const R = Math.min(W, H) * 0.25;
      debrisBudget = spritesThisFrame + 130;
      crackStar(x, y, R * 1.3, 16);
      shatter(x, y, R, by, null, 0, 0, 0.3, 1.4);
      g.shockwaves.push({ x, y, r: 0, maxR: R * 1.3, life: 0.6 });
      burst(x, y, 50, BOMB_COLOR, H * 1.1);
      burst(x, y, 30, BALL_COLOR, H * 0.9);
      burst(x, y, 20, "#ff2d2d", H * 0.8);
      burst(x, y, 14, "#ffffff", H * 0.6);
      g.shake = 26;
      g.flash = 0.6;
      g.flashColor = "#fff3c4";
      g.hitStop = 0.12;
      addText("KABOOM!", x, clamp(y, H * 0.3, H * 0.7), BOMB_COLOR, geo.narrow ? 26 : 40, 1.4);

      for (const side of ["player", "cpu"] as Side[]) {
        const p = side === "player" ? g.player : g.cpu;
        if (p.koUntil > g.time) continue;
        const caught = direct === side || (nearKO && Math.hypot(p.x - x, p.y + p.h / 2 - y) < R * 0.55);
        if (!caught) continue;
        p.koUntil = g.time + KO_SECONDS;
        const color = side === "player" ? PLAYER_COLOR : CPU_COLOR;
        for (let i = 0; i < 26; i++) {
          const life = rand(0.6, 1.1);
          g.sparks.push({
            x: p.x + rand(-p.w / 2, p.w / 2),
            y: p.y + rand(0, p.h),
            vx: rand(-1, 1) * H * 0.6,
            vy: rand(-1, 0.3) * H * 0.7,
            life,
            maxLife: life,
            size: rand(5, 9),
            color,
          });
        }
        const labelY = side === "cpu" ? p.y + 70 : p.y - 60;
        if (side !== by) {
          g.score[by] += KO_POINTS;
          if (by === "player") g.kos++;
          addText(by === "player" ? `PADDLE KO! +${KO_POINTS}` : "YOUR PADDLE IS DOWN!", W / 2, labelY, by === "player" ? PLAYER_COLOR : CPU_COLOR, 14, 1.8);
        } else {
          addText("SELF DESTRUCT!", W / 2, labelY, SMASH_COLOR, 14, 1.8);
        }
      }

      if (resetBall) {
        // The bomb is spent; whoever took the blast serves a fresh ball once they're back
        const victim: Side = direct ?? (by === "player" ? "cpu" : "player");
        const vp = victim === "player" ? g.player : g.cpu;
        b.held = victim;
        b.owner = victim;
        b.vx = 0;
        b.vy = 0;
        b.spin = 0;
        b.combo = 0;
        b.trail = [];
        b.serveAt = Math.max(g.time + 1, vp.koUntil + 0.4);
      }
    };

    // Calls fn for every live shard whose centroid lies within radius (+ slack × shard size) of (x, y)
    const forShardsNear = (x: number, y: number, radius: number, fn: (t: number) => void, slack = 0.4) => {
      const cell = Math.max(geo.sx, geo.sy);
      const span = radius + cell * 0.5;
      const c0 = Math.max(0, Math.floor((x - span) / geo.sx));
      const c1 = Math.min(geo.cols - 1, Math.floor((x + span) / geo.sx));
      const r0 = Math.max(0, Math.floor((y - span) / geo.sy));
      const r1 = Math.min(geo.rows - 1, Math.floor((y + span) / geo.sy));
      const reach = radius + cell * slack;
      const lim = reach * reach;
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          for (let k = 0; k < 2; k++) {
            const t = (r * geo.cols + c) * 2 + k;
            if (!alive[t]) continue;
            const dx = cx[t] - x;
            const dy = cy[t] - y;
            if (dx * dx + dy * dy <= lim) fn(t);
          }
        }
      }
    };

    const shardPath = (c: CanvasRenderingContext2D, t: number, ox = 0, oy = 0) => {
      const a = tri[t * 3];
      const b = tri[t * 3 + 1];
      const d = tri[t * 3 + 2];
      c.moveTo(px[a] - ox, py[a] - oy);
      c.lineTo(px[b] - ox, py[b] - oy);
      c.lineTo(px[d] - ox, py[d] - oy);
      c.closePath();
    };

    // Spider-web cracks around an impact, drawn only on glass that is still there
    const crackStar = (x: number, y: number, radius: number, rays: number) => {
      screenCtx.save();
      screenCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      screenCtx.beginPath();
      let any = false;
      forShardsNear(x, y, radius, (t) => {
        shardPath(screenCtx, t);
        any = true;
      });
      if (!any) {
        screenCtx.restore();
        return;
      }
      screenCtx.clip();
      const lines: number[][] = [];
      const ringA: number[] = [];
      const ringB: number[] = [];
      for (let i = 0; i < rays; i++) {
        let a = (i / rays) * Math.PI * 2 + rand(-0.25, 0.25);
        const len = radius * rand(0.6, 1.2);
        const pts = [x, y];
        let qx = x;
        let qy = y;
        const steps = 5;
        for (let k = 1; k <= steps; k++) {
          a += rand(-0.22, 0.22);
          qx += (Math.cos(a) * len) / steps;
          qy += (Math.sin(a) * len) / steps;
          pts.push(qx, qy);
          if (k === 2) ringA.push(qx, qy);
          if (k === 4) ringB.push(qx, qy);
        }
        lines.push(pts);
      }
      lines.push([...ringA, ringA[0], ringA[1]]);
      if (Math.random() < 0.6) lines.push([...ringB, ringB[0], ringB[1]]);
      // Dark + light stroke so cracks read on both light and dark pages
      const strokes: [string, number, number][] = [
        ["rgba(0,0,0,0.3)", 1.2, 0],
        ["rgba(255,255,255,0.6)", 0.8, 0.7],
      ];
      for (const [style, width, off] of strokes) {
        screenCtx.strokeStyle = style;
        screenCtx.lineWidth = width;
        screenCtx.beginPath();
        for (const pts of lines) {
          screenCtx.moveTo(pts[0] + off, pts[1] + off);
          for (let k = 2; k < pts.length; k += 2) screenCtx.lineTo(pts[k] + off, pts[k + 1] + off);
        }
        screenCtx.stroke();
      }
      screenCtx.restore();
    };

    const spawnShardDebris = (t: number, vx: number, vy: number) => {
      if (spritesThisFrame >= debrisBudget) return;
      spritesThisFrame++;
      const a = tri[t * 3];
      const b = tri[t * 3 + 1];
      const d = tri[t * 3 + 2];
      const minX = Math.floor(Math.min(px[a], px[b], px[d]));
      const minY = Math.floor(Math.min(py[a], py[b], py[d]));
      const w = Math.ceil(Math.max(px[a], px[b], px[d])) - minX + 1;
      const h = Math.ceil(Math.max(py[a], py[b], py[d])) - minY + 1;
      const img = document.createElement("canvas");
      img.width = Math.ceil(w * dpr);
      img.height = Math.ceil(h * dpr);
      const ic = img.getContext("2d");
      if (!ic) return;
      ic.setTransform(dpr, 0, 0, dpr, 0, 0);
      ic.beginPath();
      shardPath(ic, t, minX, minY);
      ic.save();
      ic.clip();
      ic.drawImage(source, minX * dpr, minY * dpr, w * dpr, h * dpr, 0, 0, w, h);
      ic.restore();
      ic.strokeStyle = "rgba(255,255,255,0.8)";
      ic.lineWidth = 1;
      ic.stroke();
      const life = rand(0.8, 1.3);
      g.debris.push({
        img,
        w,
        h,
        ox: cx[t] - minX,
        oy: cy[t] - minY,
        x: cx[t],
        y: cy[t],
        vx: vx + rand(-1, 1) * H * 0.15,
        vy: vy + rand(-0.2, 0.05) * H,
        rot: 0,
        vr: rand(-8, 8),
        life,
        maxLife: life,
      });
    };

    // Break one shard out of the frozen screen. Shards left hanging with no
    // neighbours fall out too, so the glass crumbles in chunks.
    const breakShard = (start: number, credit: Side | null, vx: number, vy: number, b: Ball | null) => {
      const queue = [start];
      while (queue.length) {
        const t = queue.pop() as number;
        if (!alive[t]) continue;
        alive[t] = 0;
        aliveCount--;

        screenCtx.save();
        screenCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        screenCtx.globalCompositeOperation = "destination-out";
        screenCtx.beginPath();
        shardPath(screenCtx, t);
        screenCtx.fill();
        screenCtx.lineWidth = 1;
        screenCtx.stroke(); // no hairline seams between neighbouring holes
        screenCtx.restore();

        spawnShardDebris(t, vx, vy);
        if (Math.random() < 0.5) burst(cx[t], cy[t], 2, shardColor[t], H * 0.3);

        if (credit) {
          let pts = 1;
          if (b) {
            b.combo++;
            const mult = Math.min(4, 1 + Math.floor((b.combo - 1) / 12));
            pts = mult;
            if (mult > 1 && (b.combo - 1) % 12 === 0) {
              addText(`COMBO x${mult}`, b.x, b.y - 26, b.owner === "player" ? PLAYER_COLOR : CPU_COLOR, 12 + mult * 2);
              charge(b.owner, 0.06);
            }
            if (b.owner === "player") g.bestCombo = Math.max(g.bestCombo, b.combo);
          }
          g.score[credit] += pts;
          g.shards[credit]++;
          charge(credit, 0.0015);
        }
        g.shake = Math.min(18, g.shake + 0.35);

        for (let k = 0; k < 3; k++) {
          const n = nb[t * 3 + k];
          if (n < 0 || !alive[n]) continue;
          if (nb[n * 3] >= 0 && alive[nb[n * 3]]) continue;
          if (nb[n * 3 + 1] >= 0 && alive[nb[n * 3 + 1]]) continue;
          if (nb[n * 3 + 2] >= 0 && alive[nb[n * 3 + 2]]) continue;
          queue.push(n);
        }
      }
    };

    // A cracked pane: one faint hairline, so the frozen page underneath stays readable
    const crackShard = (t: number, x: number, y: number) => {
      const ox = cx[t] + (x - cx[t]) * 0.4;
      const oy = cy[t] + (y - cy[t]) * 0.4;
      const v = tri[t * 3 + Math.floor(Math.random() * 3)];
      screenCtx.save();
      screenCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      screenCtx.beginPath();
      shardPath(screenCtx, t);
      screenCtx.clip();
      screenCtx.strokeStyle = "rgba(255,255,255,0.45)";
      screenCtx.lineWidth = 0.8;
      screenCtx.beginPath();
      screenCtx.moveTo(ox, oy);
      screenCtx.lineTo((ox + px[v]) / 2 + rand(-3, 3), (oy + py[v]) / 2 + rand(-3, 3));
      screenCtx.lineTo(px[v], py[v]);
      screenCtx.stroke();
      screenCtx.restore();
    };

    // The ball passing over the glass: a pane cracks on the first touch and breaks on
    // the next one, unless the ball is going fast enough to smash straight through.
    const ballPass = (b: Ball) => {
      const fast = Math.hypot(b.vx, b.vy) >= smashSpeed();
      const hits: number[] = [];
      forShardsNear(b.x, b.y, breakRadius(b), (t) => hits.push(t), 0);
      for (const t of hits) {
        if (!alive[t]) continue; // already fell in a cascade earlier in this loop
        if (!fast && g.time - hitAt[t] < 0.35) continue; // same touch, still over this pane
        hitAt[t] = g.time;
        if (!fast && hp[t] > 1) {
          hp[t]--;
          crackShard(t, b.x, b.y);
          continue;
        }
        breakShard(t, b.owner, b.vx * 0.25 + rand(-1, 1) * H * 0.05, b.vy * 0.25, b);
      }
    };

    const shatter = (
      x: number,
      y: number,
      radius: number,
      credit: Side | null,
      b: Ball | null,
      vx = 0,
      vy = 0,
      slack = 0.4,
      power = 0.35,
    ) => {
      const hits: number[] = [];
      forShardsNear(x, y, radius, (t) => hits.push(t), slack);
      for (const t of hits) {
        const dx = cx[t] - x;
        const dy = cy[t] - y;
        const dist = Math.hypot(dx, dy) || 1;
        // Shards blow outward from the impact on top of the ball's push
        const push = H * power * (1 - Math.min(1, dist / (radius + 1)));
        breakShard(t, credit, vx + (dx / dist) * push, vy + (dy / dist) * push, b);
      }
    };

    // ---------- physics ----------

    const fixAngle = (b: Ball) => {
      // Never let the ball go (nearly) horizontal, rallies must keep moving
      const s = Math.hypot(b.vx, b.vy);
      const minVy = s * 0.34;
      if (Math.abs(b.vy) < minVy) {
        b.vy = (b.vy >= 0 ? 1 : -1) * minVy;
        b.vx = (b.vx >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, s * s - minVy * minVy));
      }
    };

    // How wide a path the ball cuts through the glass: faster balls break more
    const breakRadius = (b: Ball) => {
      const s = Math.hypot(b.vx, b.vy);
      return b.r * (1 + 3 * clamp((s - H * 0.55) / (H * 1.45), 0, 1));
    };

    const paddleStrike = (b: Ball, side: Side, isServe: boolean) => {
      const p = side === "player" ? g.player : g.cpu;
      const dir = side === "player" ? -1 : 1;
      const off = isServe ? 0 : clamp((b.x - p.x) / (p.w / 2), -1, 1);
      let swipe = clamp(p.vx / geo.pvRef, -1.6, 1.6);
      if (side === "cpu" && ai.smash) {
        swipe = clamp(swipe + ai.swipeDir * rand(0.75, 1.1) * (0.6 + 0.4 * g.d), -1.6, 1.6);
        ai.smash = false;
      }

      // Hot potato: a bomb reaching the other side's paddle blows it up, unless they
      // smash it straight back (the fuse keeps burning)
      let returned = false;
      if (!isServe && b.bomb && b.bomb.by !== side) {
        if (Math.abs(swipe) <= 0.6) {
          explode(b, b.x, side === "player" ? p.y : p.y + p.h, side, false, true);
          return;
        }
        b.bomb.by = side;
        returned = true;
        addText("RETURNED!", b.x, b.y + dir * 40, BOMB_COLOR, 14, 1.2);
      }

      let angle = off * 0.95 + swipe * 0.42;
      if (isServe && Math.abs(swipe) < 0.15) angle += rand(-0.35, 0.35);
      angle = clamp(angle, -1.15, 1.15);

      const cur = Math.hypot(b.vx, b.vy);
      const cruise = cruiseSpeed();
      // A full meter lights a bomb on this hit
      const lightBomb = !b.bomb && g.phase === "play" && g.meter[side] >= 1 && !g.balls.some((o) => o.bomb);
      if (lightBomb) {
        b.bomb = { fuse: FUSE_SECONDS, by: side };
        g.meter[side] = 0;
      }
      // Speed regresses toward cruise on a still paddle, a fast swipe adds a lot on top.
      // Bombs are capped so the other side has a fair chance to smash them back.
      const speed = clamp(
        (isServe ? cruise : lerp(cur, cruise, 0.5)) + Math.abs(swipe) * H * 0.6,
        H * 0.45,
        b.bomb ? H * 1.25 : maxSpeed(),
      );
      b.vx = Math.sin(angle) * speed;
      b.vy = dir * Math.cos(angle) * speed;
      b.spin = -swipe * H * 0.55; // the ball bends back against the swipe
      b.owner = side;
      b.held = null;
      b.combo = 0;
      b.bounces++;
      b.y = side === "player" ? p.y - b.r - 0.5 : p.y + p.h + b.r + 0.5;

      const kmh = toKmh(speed);
      if (side === "player") {
        g.lastSpeed = kmh;
        g.topSpeed = Math.max(g.topSpeed, kmh);
      }
      const color = side === "player" ? PLAYER_COLOR : CPU_COLOR;
      if (lightBomb) {
        addText(side === "player" ? "BOMB AWAY!" : "INCOMING BOMB!", W / 2, side === "player" ? H * 0.42 : H * 0.58, BOMB_COLOR, 18, 1.4);
        if (side === "cpu") addText("SWIPE IT BACK OR DODGE", W / 2, g.player.y - 70, "#ffffff", 10, 2);
        burst(b.x, b.y, 16, BOMB_COLOR, H * 0.5);
        g.shake = Math.min(18, g.shake + 4);
      }
      if (!returned && Math.abs(swipe) > 0.7 && speed >= smashSpeed()) charge(side, 0.25);
      if (Math.abs(swipe) > 0.7 && speed >= smashSpeed()) {
        addText(`SMASH ${kmh} KM/H`, b.x, b.y + dir * 34, SMASH_COLOR, geo.narrow ? 12 : 16);
        g.shake = Math.min(18, g.shake + 9);
        g.hitStop = 0.07;
        burst(b.x, b.y, 18, SMASH_COLOR, H * 0.7);
        burst(b.x, b.y, 8, "#ffffff", H * 0.5);
        crackStar(b.x, b.y, geo.S * 2.2, 8);
        shatter(b.x, b.y, geo.S * 1.4, side, b, b.vx * 0.3, b.vy * 0.3);
      } else {
        burst(b.x, b.y, 6, color, H * 0.3);
        g.shake = Math.min(18, g.shake + 1.5);
      }
    };

    const stepBall = (b: Ball, h: number) => {
      if (b.spin !== 0) {
        b.vx += b.spin * h;
        b.spin *= Math.exp(-h / 0.7);
        if (Math.abs(b.spin) < 1) b.spin = 0;
        fixAngle(b);
      }
      b.x += b.vx * h;
      b.y += b.vy * h;

      if (b.x < b.r || b.x > W - b.r) {
        const left = b.x < b.r;
        b.x = left ? b.r : W - b.r;
        b.vx = left ? Math.abs(b.vx) : -Math.abs(b.vx);
        b.spin = 0;
        burst(b.x, b.y, 4, "#ffffff", H * 0.25);
        shatter(b.x, b.y, Math.max(breakRadius(b) * 1.3, geo.S * 0.4), b.owner, b, b.vx * 0.2, b.vy * 0.2, 0.15);
        g.shake = Math.min(18, g.shake + 2);
      }

      // A knocked-out paddle isn't there to hit anything
      const P = g.player;
      if (P.koUntil <= g.time && b.vy > 0 && b.y + b.r >= P.y && b.y - b.r <= P.y + P.h && Math.abs(b.x - P.x) <= P.w / 2 + b.r * 0.7) {
        paddleStrike(b, "player", false);
        if (b.held) return; // the bomb went off on the paddle
      }
      const C = g.cpu;
      if (C.koUntil <= g.time && b.vy < 0 && b.y - b.r <= C.y + C.h && b.y + b.r >= C.y && Math.abs(b.x - C.x) <= C.w / 2 + b.r * 0.7) {
        paddleStrike(b, "cpu", false);
        if (b.held) return;
      }

      // The ball punches straight through the frozen screen
      if (b.y > 0 && b.y < H) ballPass(b);
    };

    const goal = (scorer: Side, b: Ball) => {
      const conceder: Side = scorer === "player" ? "cpu" : "player";
      g.score[scorer] += GOAL_POINTS;
      charge(scorer, 0.08);
      const color = scorer === "player" ? PLAYER_COLOR : CPU_COLOR;
      const edgeY = scorer === "player" ? 0 : H;
      // A dodged bomb still goes off at the goal line (crater + goal, but no paddle KO)
      if (b.bomb) explode(b, b.x, edgeY, null, false, false);
      burst(b.x, edgeY, 30, color, H * 0.8);
      burst(b.x, edgeY, 12, "#ffffff", H * 0.6);
      crackStar(b.x, edgeY, geo.S * 3, 9);
      shatter(b.x, edgeY, geo.S * 2, scorer, null, 0, scorer === "player" ? H * 0.4 : -H * 0.6);
      addText(scorer === "player" ? `GOAL! +${GOAL_POINTS}` : `CPU SCORES +${GOAL_POINTS}`, W / 2, H / 2, color, geo.narrow ? 16 : 24, 1.4);
      g.shake = Math.min(20, g.shake + 14);
      g.flash = 0.35;
      g.flashColor = color;
      // The side that conceded serves next
      b.held = conceder;
      b.owner = conceder;
      b.vx = 0;
      b.vy = 0;
      b.spin = 0;
      b.combo = 0;
      b.trail = [];
      b.serveAt = g.time + (conceder === "player" ? 0.6 : rand(0.7, 1.3));
    };

    // ---------- players ----------

    const updatePlayer = (dt: number) => {
      const P = g.player;
      if (input.left || input.right || input.nudge !== 0) {
        const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        const kb = Math.max(W * 1.1, 700) * (input.boost ? 1.9 : 1);
        input.pointerX = clamp((input.pointerX ?? P.x) + dir * kb * dt + input.nudge, P.w / 2, W - P.w / 2);
        input.nudge = 0;
      }
      if (input.pointerX !== null) P.x = clamp(input.pointerX, P.w / 2, W - P.w / 2);
      if (input.snap) {
        P.prevX = P.x;
        P.vx = 0;
        input.snap = false;
      }
      const raw = clamp((P.x - P.prevX) / Math.max(dt, 1e-3), -W * 8, W * 8);
      P.vx += (raw - P.vx) * Math.min(1, dt / 0.05);
      P.prevX = P.x;
    };

    const predictX = (b: Ball, targetY: number) => {
      const t = (b.y - targetY) / -b.vy;
      const x = b.x + b.vx * t;
      const span = W - 2 * b.r;
      let u = (x - b.r) % (2 * span);
      if (u < 0) u += 2 * span;
      if (u > span) u = 2 * span - u;
      return b.r + u;
    };

    const updateCpu = (dt: number) => {
      const C = g.cpu;
      const d = g.d;
      let threat: Ball | null = null;
      let tMin = Infinity;
      for (const b of g.balls) {
        if (b.held || b.vy >= 0) continue;
        const t = (b.y - b.r - (C.y + C.h)) / -b.vy;
        if (t > -0.05 && t < tMin) {
          tMin = t;
          threat = b;
        }
      }

      // The CPU only re-reads the table every so often (reaction time), with an
      // aiming error that shrinks as it levels up. It ignores spin, so curving shots fool it.
      ai.reactIn -= dt;
      if (ai.reactIn <= 0) {
        ai.reactIn = lerp(0.2, 0.07, d) * rand(0.8, 1.2);
        if (threat) {
          const key = `${threat.id}:${threat.bounces}`;
          if (key !== ai.key) {
            ai.key = key;
            ai.err = rand(-1, 1) * C.w * (0.62 - 0.45 * d);
            ai.swipeDir = g.player.x < W / 2 ? 1 : -1; // aim away from the player
            ai.smash = Math.random() < 0.1 + 0.45 * d;
            ai.aimOff = d > 0.3 && !ai.smash ? rand(0.2, 0.6) * ai.swipeDir : 0;
            // An incoming bomb: try to smash it back (more likely as it levels up) or get out of the way
            ai.bombPlan = threat.bomb && threat.bomb.by !== "cpu" ? (Math.random() < 0.3 + 0.5 * d ? "return" : "dodge") : "";
            if (ai.bombPlan === "return") ai.smash = true;
            if (ai.bombPlan === "dodge") ai.smash = false;
          }
          const tx = predictX(threat, C.y + C.h + threat.r);
          ai.target = tx + ai.err - (ai.aimOff * C.w) / 2 - (ai.smash ? ai.swipeDir * C.w * 0.15 : 0);
          if (ai.bombPlan === "dodge") ai.target = tx + (tx < W / 2 ? 1 : -1) * (C.w * 0.9 + threat.r * 3);
        } else {
          let nx = W / 2;
          let best = Infinity;
          for (const b of g.balls) {
            if (b.held) continue;
            const dist = Math.abs(b.y - C.y);
            if (dist < best) {
              best = dist;
              nx = b.x;
            }
          }
          ai.target = W / 2 + (nx - W / 2) * 0.35;
        }
      }

      const maxV = Math.max(W * (0.95 + 0.95 * d), 560 + 640 * d);
      const accel = maxV * 14;
      let desired = clamp((ai.target - C.x) * 18, -maxV, maxV);
      if (threat && ai.smash && tMin < 0.1 && Math.abs(ai.target - C.x) < C.w * 0.3) desired = ai.swipeDir * maxV; // visible lunge into the smash
      C.vx += clamp(desired - C.vx, -accel * dt, accel * dt);
      C.x += C.vx * dt;
      if (C.x < C.w / 2 || C.x > W - C.w / 2) {
        C.x = clamp(C.x, C.w / 2, W - C.w / 2);
        C.vx = 0;
      }
    };

    const serveHeld = () => {
      const heldCount: Record<Side, number> = { player: 0, cpu: 0 };
      for (const b of g.balls) {
        if (!b.held) continue;
        const side = b.held;
        const p = side === "player" ? g.player : g.cpu;
        const k = heldCount[side]++;
        b.x = clamp(p.x + k * b.r * 3, b.r, W - b.r);
        b.y = side === "player" ? p.y - b.r - 1 : p.y + p.h + b.r + 1;
        if (g.phase !== "play" || g.time < b.serveAt || k > 0 || p.koUntil > g.time) continue;
        if (side === "player") {
          if (input.serve || Math.abs(g.player.vx) > geo.pvRef * 0.45 || g.time > b.serveAt + 1.6) {
            paddleStrike(b, "player", true);
          }
        } else {
          paddleStrike(b, "cpu", true);
        }
      }
      input.serve = false;
    };

    // ---------- main update ----------

    const finish = () => {
      g.phase = "over";
      g.overAt = g.time;
      for (let t = 0; t < total; t++) if (alive[t]) breakShard(t, null, 0, 0, null);
      for (const b of g.balls) burst(b.x, b.y, 14, "#ffffff", H * 0.5);
      g.balls = [];
      g.shake = 20;
      g.flash = 0.5;
      g.flashColor = "#ffffff";
      addText("SCREEN DESTROYED", W / 2, H / 2, "#ffffff", geo.narrow ? 16 : 26, 1.6);
    };

    const update = (dt: number) => {
      g.time += dt;
      spritesThisFrame = 0;
      debrisBudget = DEBRIS_PER_FRAME;
      let sim = dt;
      if (g.hitStop > 0) {
        g.hitStop -= dt;
        sim = dt * 0.12;
      }

      updatePlayer(dt);

      if (g.phase === "intro") {
        if (!introCracked && g.time > 0.55) {
          // The freeze: the glass cracks from the middle before play starts
          introCracked = true;
          crackStar(W / 2, H / 2, Math.min(W, H) * 0.3, 10);
          g.shake = 10;
          g.flash = 0.25;
          g.flashColor = "#ffffff";
        }
        if (g.time >= introEnd) {
          g.phase = "play";
          addText("BREAK IT!", W / 2, H / 2, "#ffffff", geo.narrow ? 20 : 30, 1.1);
        }
      }

      if (g.phase === "play") {
        g.playTime += sim;
        const destroyed = 1 - aliveCount / total;
        const lead = (g.score.player - g.score.cpu) / Math.max(80, total * 0.25);
        g.d = clamp(0.08 + (g.playTime / 90) * 0.55 + destroyed * 0.3 + clamp(lead, -0.25, 0.25), 0, 1);
        g.level = 1 + Math.floor(g.d * 4.999);
        if (g.level > g.maxLevel) {
          g.maxLevel = g.level;
          addText(`CPU LEVEL ${g.level}`, W / 2, H / 2 + 80, CPU_COLOR, 12, 1.4);
        }
      }
      if (g.phase !== "over") updateCpu(sim);

      serveHeld();

      for (const b of g.balls) {
        if (b.held) continue;
        // The fuse burns down wherever the bomb is, even on the side that sent it
        if (b.bomb) {
          b.bomb.fuse -= sim;
          if (b.bomb.fuse <= 0) {
            explode(b, b.x, b.y, null, true, true);
            continue;
          }
        }
        const speed = Math.hypot(b.vx, b.vy);
        const n = clamp(Math.ceil((speed * sim) / (b.r * 0.5)), 1, 24);
        const h = sim / n;
        for (let i = 0; i < n && !b.held; i++) stepBall(b, h);
        if (b.held) continue; // exploded on a paddle mid-step
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 14) b.trail.shift();
        if (b.y - b.r > H) goal("cpu", b);
        else if (b.y + b.r < 0) goal("player", b);
      }

      if (g.phase === "play") {
        if (!g.multiballDone && aliveCount / total <= 0.5 && g.balls.length < 3) {
          g.multiballDone = true;
          const behind: Side = g.score.cpu < g.score.player ? "cpu" : "player";
          g.balls.push(makeBall(behind, g.time + 0.8));
          addText("MULTIBALL!", W / 2, H / 2 + 44, "#f8d878", geo.narrow ? 14 : 20, 1.3);
        }
        // Stragglers are hard to hit, so the last 15% of the screen starts falling apart by itself
        if (aliveCount / total < 0.15 && g.time >= g.crumbleAt) {
          if (!g.collapsing) {
            g.collapsing = true;
            addText("THE SCREEN IS COLLAPSING", W / 2, H / 2 - 40, "#f8d878", geo.narrow ? 10 : 14, 1.6);
          }
          g.crumbleAt = g.time + 0.12;
          let pick = Math.floor(Math.random() * total);
          for (let i = 0; i < total && !alive[pick]; i++) pick = (pick + 1) % total;
          if (alive[pick]) breakShard(pick, null, 0, 0, null);
        }
        if (aliveCount <= Math.max(3, Math.floor(total * 0.02))) finish();
      }

      if (g.phase === "over" && !g.resultSent && g.time - g.overAt > 1.5) {
        g.resultSent = true;
        const { player, cpu } = g.score;
        setResult({
          winner: player === cpu ? "tie" : player > cpu ? "player" : "cpu",
          player,
          cpu,
          playerShards: g.shards.player,
          cpuShards: g.shards.cpu,
          bestCombo: g.bestCombo,
          topSpeed: g.topSpeed,
          kos: g.kos,
        });
      }

      // Debris, sparks, texts (slowed by hit-stop too)
      const grav = H * 2.2;
      for (const d of g.debris) {
        d.vy += grav * sim;
        d.x += d.vx * sim;
        d.y += d.vy * sim;
        d.rot += d.vr * sim;
        d.life -= sim;
      }
      g.debris = g.debris.filter((d) => {
        const keep = d.life > 0 && d.y < H + geo.S * 2;
        if (!keep) d.img.width = d.img.height = 0;
        return keep;
      });
      if (g.debris.length > MAX_DEBRIS) {
        for (const d of g.debris.splice(0, g.debris.length - MAX_DEBRIS)) d.img.width = d.img.height = 0;
      }

      for (const s of g.sparks) {
        s.vy += grav * 0.5 * sim;
        s.vx *= Math.exp(-sim * 2);
        s.x += s.vx * sim;
        s.y += s.vy * sim;
        s.life -= sim;
      }
      g.sparks = g.sparks.filter((s) => s.life > 0);
      if (g.sparks.length > MAX_SPARKS) g.sparks.splice(0, g.sparks.length - MAX_SPARKS);

      for (const t of g.texts) {
        t.life -= dt;
        t.y -= 26 * dt;
      }
      g.texts = g.texts.filter((t) => t.life > 0);

      for (const s of g.shockwaves) {
        s.life -= sim;
        s.r = s.maxR * (1 - Math.max(0, s.life) / 0.6);
      }
      g.shockwaves = g.shockwaves.filter((s) => s.life > 0);

      g.shake *= Math.exp(-dt * 10);
      if (g.shake < 0.2) g.shake = 0;
      g.flash = Math.max(0, g.flash - dt);
    };

    // ---------- rendering (8-bit) ----------

    // Everything the game draws itself sits on a chunky pixel grid
    const snap = (v: number, u: number) => Math.round(v / u) * u;

    // Pixel-art sprite centred on (x, y): one string per row, one char per pixel,
    // looked up in the palette ("." = transparent)
    const sprite = (rows: string[], x: number, y: number, u: number, palette: Record<string, string>) => {
      const ox = Math.round(x - (rows[0].length * u) / 2);
      const oy = Math.round(y - (rows.length * u) / 2);
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        for (let c = 0; c < row.length; c++) {
          const color = palette[row[c]];
          if (!color) continue;
          ctx.fillStyle = color;
          ctx.fillRect(ox + c * u, oy + r * u, u, u);
        }
      }
    };

    // Filled pixel disk, one rect per row
    const pixelDisk = (x: number, y: number, radius: number, u: number) => {
      const cx0 = snap(x, u);
      const cy0 = snap(y, u);
      for (let yy = -radius; yy <= radius; yy += u) {
        const half = snap(Math.sqrt(Math.max(0, radius * radius - yy * yy)), u);
        if (half > 0) ctx.fillRect(cx0 - half, cy0 + yy, half * 2, u);
      }
    };

    // Text with a hard 8-bit drop shadow; shrinks itself to fit the screen width
    const pixelText = (text: string, x: number, y: number, color: string, size: number, alpha = 1) => {
      ctx.font = `${size}px ${FONT}`;
      const w = ctx.measureText(text).width;
      if (w > W - 16) {
        size = Math.max(6, Math.floor((size * (W - 16)) / w));
        ctx.font = `${size}px ${FONT}`;
      }
      const s = Math.max(2, Math.round(size / 6));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#000000";
      ctx.fillText(text, x + s, y + s);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;
    };

    const drawPaddle = (p: Paddle, color: string) => {
      const u = geo.u;
      const x0 = snap(p.x - p.w / 2, u);
      const y0 = snap(p.y, u);
      const w = Math.max(u * 6, snap(p.w, u));
      const h = Math.max(u * 3, snap(p.h, u));

      if (p.koUntil > g.time) {
        // Knocked out: a blinking dotted outline shows where it comes back
        const left = p.koUntil - g.time;
        if (left < 1.2 && Math.floor(left * 8) % 2 === 0) {
          ctx.fillStyle = color;
          for (let x = x0; x < x0 + w; x += u * 2) {
            ctx.fillRect(x, y0, u, u);
            ctx.fillRect(x, y0 + h - u, u, u);
          }
        }
        return;
      }

      // Motion ghost when swiping fast
      const sw = Math.abs(p.vx) / geo.pvRef;
      if (sw > 0.35) {
        ctx.globalAlpha = Math.min(0.35, sw * 0.25);
        ctx.fillStyle = color;
        ctx.fillRect(snap(x0 - p.vx * 0.035, u), y0, w, h);
        ctx.globalAlpha = 1;
      }
      // Black outline with notched corners, body, highlight row, shadow row, lighter end caps
      ctx.fillStyle = "#000000";
      ctx.fillRect(x0 - u, y0, w + 2 * u, h);
      ctx.fillRect(x0, y0 - u, w, h + 2 * u);
      ctx.fillStyle = color;
      ctx.fillRect(x0, y0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.fillRect(x0 + u, y0, w - 2 * u, u);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(x0 + u, y0 + h - u, w - 2 * u, u);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(x0, y0 + u, u, h - 2 * u);
      ctx.fillRect(x0 + w - u, y0 + u, u, h - 2 * u);
    };

    const BALL_SPRITE = [
      "..KKKK..",
      ".KYYYYK.",
      "KYWWYYYK",
      "KYWYYYYK",
      "KYYYYYTK",
      "KYYYYTTK",
      ".KYYTTK.",
      "..KKKK..",
    ];
    const BOMB_SPRITE = [
      "......SS..",
      ".....F....",
      "....FF....",
      "...OOOO...",
      "..ODDDDO..",
      ".ODGGDDDO.",
      ".ODGDDDDO.",
      ".ODDDDDDO.",
      ".ODDDDDDO.",
      "..ODDDDO..",
      "...OOOO...",
    ];

    // The ball has to stay readable over white pages, colour blobs, dark holes and flying
    // shards: neon yellow (not in the site palette), black outline, a dark pixel halo and a
    // spinning ring of pixels. Bombs are a black bomb with a white outline and a lit fuse.
    const drawBall = (b: Ball) => {
      if (b.held && (b.held === "player" ? g.player : g.cpu).koUntil > g.time) return; // its paddle is gone
      const fast = !b.bomb && Math.hypot(b.vx, b.vy) >= smashSpeed();
      const tint = fast ? SMASH_COLOR : b.owner === "player" ? PLAYER_COLOR : CPU_COLOR;
      const main = b.bomb ? BOMB_COLOR : fast ? SMASH_COLOR : BALL_COLOR;
      const u = Math.max(3, Math.round((b.r * 2.8) / 8));

      // Trail: chunky squares that shrink and fade
      for (let i = 0; i < b.trail.length; i += 2) {
        const k = (i + 1) / b.trail.length;
        const s = Math.max(u, snap(u * 3 * k, u));
        const tx = Math.round(b.trail[i].x - s / 2);
        const ty = Math.round(b.trail[i].y - s / 2);
        ctx.globalAlpha = k * 0.85;
        ctx.fillStyle = "#000000";
        ctx.fillRect(tx - 1, ty - 1, s + 2, s + 2);
        ctx.fillStyle = i % 4 === 0 ? main : tint;
        ctx.fillRect(tx, ty, s, s);
      }

      // Dark halo and a soft glow of the ball colour
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = "#000000";
      pixelDisk(b.x, b.y, u * 6, u);
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = main;
      pixelDisk(b.x, b.y, u * 5, u);

      // Ring of pixels orbiting the ball
      const pulse = 1 + 0.12 * Math.sin(g.time * 12 + b.id);
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = b.bomb ? BOMB_COLOR : fast ? SMASH_COLOR : "#ffffff";
      for (let i = 0; i < 8; i++) {
        const a = g.time * 4 + (i * Math.PI) / 4;
        ctx.fillRect(Math.round(b.x + Math.cos(a) * u * 7 * pulse - u / 2), Math.round(b.y + Math.sin(a) * u * 7 * pulse - u / 2), u, u);
      }
      ctx.globalAlpha = 1;

      if (b.bomb) {
        const fuse = b.bomb.fuse;
        const rate = fuse < 1 ? 16 : fuse < 2.5 ? 8 : 3;
        const hot = Math.floor(g.time * rate) % 2 === 0 && fuse < 2.5;
        const spark = ["#ffe600", "#ff7a00", "#ffffff", "#ff2d2d"][Math.floor(g.time * 20) % 4];
        sprite(BOMB_SPRITE, b.x, b.y - u, u, { O: "#ffffff", D: hot ? "#d01010" : "#1b1b1b", G: "#8a8a8a", F: "#c08040", S: spark });
        // Countdown above the fuse
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        pixelText(String(Math.ceil(fuse)), b.x, b.y - u * 7, hot ? "#ff2d2d" : "#ffffff", 10);
      } else {
        sprite(BALL_SPRITE, b.x, b.y, u, { K: "#000000", Y: main, W: "#ffffff", T: tint });
      }
    };

    // Pixel arrow on the bottom edge showing where each incoming ball will cross your paddle line
    const drawLandingMarkers = () => {
      const P = g.player;
      const u = geo.u;
      for (const b of g.balls) {
        if (b.held || b.vy <= 0 || b.y > P.y) continue;
        const t = (P.y - b.y) / b.vy;
        if (t > 1.6) continue;
        const span = W - 2 * b.r;
        let q = (b.x + b.vx * t - b.r) % (2 * span);
        if (q < 0) q += 2 * span;
        if (q > span) q = 2 * span - q;
        const x = Math.round(b.r + q);
        const y = snap(P.y + P.h + 8, u);
        ctx.globalAlpha = clamp(1.6 - t, 0.25, 0.9);
        for (const [color, off] of [
          ["#000000", u],
          [b.bomb ? BOMB_COLOR : BALL_COLOR, 0],
        ] as const) {
          ctx.fillStyle = color;
          for (let i = 0; i < 3; i++) ctx.fillRect(x - (i + 0.5) * u + off, y + i * u + off, (2 * i + 1) * u, u);
        }
      }
      ctx.globalAlpha = 1;
    };

    // Bomb meter: 8 segments under each score; blinks when a bomb is ready
    const drawMeter = (side: Side, x: number, y: number, alignRight: boolean) => {
      const n = 8;
      const seg = geo.narrow ? 5 : 7;
      const segH = geo.narrow ? 6 : 8;
      const gap = 2;
      const barW = n * (seg + gap) - gap;
      const full = g.meter[side] >= 1;
      const blink = full && Math.floor(g.time * 6) % 2 === 0;
      const lit = full ? n : Math.floor(g.meter[side] * n);
      ctx.font = `8px ${FONT}`;
      const lw = ctx.measureText("BOMB").width;
      const bx = alignRight ? x - barW : x + lw + 8;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      pixelText("BOMB", alignRight ? x - barW - 8 - lw : x, y, full ? (blink ? "#ffffff" : BOMB_COLOR) : "rgba(255,255,255,0.85)", 8);
      ctx.fillStyle = "#000000";
      ctx.fillRect(bx - 2, y - 2, barW + 4, segH + 4);
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i < lit ? (blink ? "#ffffff" : BOMB_COLOR) : "rgba(255,255,255,0.2)";
        ctx.fillRect(bx + i * (seg + gap), y, seg, segH);
      }
    };

    const drawHud = () => {
      const top = 12;
      const size = geo.narrow ? 12 : 16;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      pixelText(`YOU ${g.score.player}`, 14, top, PLAYER_COLOR, size);
      ctx.textAlign = "right";
      pixelText(`${g.score.cpu} CPU`, W - 58, top, CPU_COLOR, size);

      // Tug-of-war bar: how much of the screen each side has destroyed
      const bw = geo.narrow ? W - 76 : Math.min(W * 0.32, 340);
      const bx = geo.narrow ? 14 : (W - bw) / 2;
      const by = geo.narrow ? top + size + 8 : top + 2;
      const bh = 8;
      ctx.fillStyle = "#000000";
      ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = PLAYER_COLOR;
      ctx.fillRect(bx, by, Math.round((bw * g.shards.player) / total), bh);
      ctx.fillStyle = CPU_COLOR;
      const cw = Math.round((bw * g.shards.cpu) / total);
      ctx.fillRect(bx + bw - cw, by, cw, bh);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      for (let x = bx + 6; x < bx + bw; x += 6) ctx.fillRect(Math.round(x), by, 1, bh);
      ctx.textAlign = "center";
      const left = Math.round((aliveCount / total) * 100);
      pixelText(`SCREEN ${left}% - CPU LV${g.level}`, bx + bw / 2, by + bh + 6, "#ffffff", 8);

      const my = geo.narrow ? by + bh + 22 : top + size + 12;
      drawMeter("player", 14, my, false);
      drawMeter("cpu", W - 58, my, true);

      // Bottom: controls hint at the start, then the speed of your last return
      ctx.textBaseline = "bottom";
      const small = geo.narrow ? 8 : 10;
      const hintUntil = introEnd + 7;
      if (g.time < hintUntil) {
        const hint = coarse
          ? "DRAG TO MOVE - SWIPE FAST = SMASH"
          : geo.narrow
            ? "MOUSE MOVES - SWIPE = SMASH - ESC"
            : "MOUSE OR ARROWS MOVE - SWIPE FAST/SHIFT = SMASH - ESC EXIT";
        ctx.textAlign = "center";
        pixelText(hint, W / 2, H - 10, "#ffffff", small, clamp(hintUntil - g.time, 0, 1));
      } else if (g.lastSpeed > 0) {
        ctx.textAlign = "left";
        const hot = g.lastSpeed >= toKmh(smashSpeed());
        pixelText(`SPD ${g.lastSpeed}`, 14, H - 10, hot ? SMASH_COLOR : PLAYER_COLOR, small);
        ctx.textAlign = "right";
        pixelText(`BEST ${g.topSpeed}`, W - 14, H - 10, "#ffffff", small);
      }

      if (g.phase === "intro" && g.time < introEnd - 0.2) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const blink = Math.floor(g.time * 4) % 2 === 0 ? 1 : 0.75;
        pixelText("SCREEN FROZEN", W / 2, H / 2, "#ffffff", geo.narrow ? 18 : 32, blink);
      }
    };

    const draw = () => {
      const shx = g.shake ? rand(-1, 1) * g.shake * motion : 0;
      const shy = g.shake ? rand(-1, 1) * g.shake * motion : 0;
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(bg, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, shx * dpr, shy * dpr);
      ctx.drawImage(screen, 0, 0, W, H);

      for (const d of g.debris) {
        const k = d.life / d.maxLife;
        const s = 0.6 + 0.4 * k;
        const cos = Math.cos(d.rot) * s * dpr;
        const sin = Math.sin(d.rot) * s * dpr;
        ctx.setTransform(cos, sin, -sin, cos, (d.x + shx) * dpr, (d.y + shy) * dpr);
        ctx.globalAlpha = Math.min(1, k * 2);
        ctx.drawImage(d.img, -d.ox, -d.oy, d.w, d.h);
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(dpr, 0, 0, dpr, shx * dpr, shy * dpr);

      for (const s of g.sparks) {
        ctx.globalAlpha = Math.min(1, (s.life / s.maxLife) * 1.5);
        ctx.fillStyle = s.color;
        ctx.fillRect(Math.round(s.x - s.size / 2), Math.round(s.y - s.size / 2), Math.round(s.size), Math.round(s.size));
      }

      // Bomb shockwaves: an expanding ring of chunky pixels
      for (const s of g.shockwaves) {
        const k = Math.max(0, s.life) / 0.6;
        const u = geo.u * 2;
        const n = Math.max(12, Math.floor((2 * Math.PI * s.r) / (u * 2)));
        ctx.globalAlpha = k;
        ctx.fillStyle = k > 0.5 ? "#ffffff" : BOMB_COLOR;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          ctx.fillRect(snap(s.x + Math.cos(a) * s.r, u), snap(s.y + Math.sin(a) * s.r, u), u, u);
        }
      }
      ctx.globalAlpha = 1;

      if (g.phase !== "over") {
        drawPaddle(g.cpu, CPU_COLOR);
        drawPaddle(g.player, PLAYER_COLOR);
      }
      if (g.phase === "play") drawLandingMarkers();
      for (const b of g.balls) drawBall(b);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (g.flash > 0) {
        ctx.globalAlpha = g.flash * 0.35 * motion;
        ctx.fillStyle = g.flashColor;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      drawHud();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const t of g.texts) {
        const k = t.life / t.maxLife;
        const pop = k > 0.85 ? 1 + (k - 0.85) * 2.5 : 1;
        const size = Math.round(t.size * pop);
        ctx.font = `${size}px ${FONT}`;
        const half = Math.min(ctx.measureText(t.text).width, W - 16) / 2;
        pixelText(t.text, clamp(t.x, half + 8, W - half - 8), t.y, t.color, size, Math.min(1, k * 2.5));
      }
    };

    // ---------- loop + input ----------

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Once the result screen is up and the last shards have settled, stop redrawing
      // (the screensaver often runs with nobody watching); Play again resumes it.
      const settled = g.phase === "over" && g.resultSent && !g.debris.length && !g.sparks.length && !g.texts.length;
      if (!settled) {
        update(dt);
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    newMatch();
    restartRef.current = () => {
      setResult(null);
      newMatch();
    };
    raf = requestAnimationFrame(loop);

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Mobile URL bars resize the viewport constantly; only rebuild on real changes
        if (Math.abs(window.innerWidth - W) > 60 || Math.abs(window.innerHeight - H) > 160) {
          setResult(null);
          newMatch();
        }
      }, 250);
    };

    let konamiPos = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exit();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Fields keep all their keys; a focused button (✕, Play again) keeps Enter/Space
      // for itself but must not swallow the arrows
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (el && el.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return;
      // Secret: ↑ ↑ ↓ ↓ ← → ← → B A arms a bomb (once per match)
      const key = e.key.toLowerCase();
      konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : key === KONAMI[0] ? 1 : 0;
      if (konamiPos === KONAMI.length) {
        konamiPos = 0;
        secretBomb();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault(); // part of the code; also keeps the page behind from scrolling
        return;
      }
      // A press is applied right away as a nudge, so quick taps that start and end
      // between two frames still move the paddle; holding keeps it gliding.
      const step = Math.max(W * 0.05, 30);
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        input.left = true;
        if (!e.repeat) input.nudge -= step;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        input.right = true;
        if (!e.repeat) input.nudge += step;
      } else if (e.key === "Shift") input.boost = true;
      else if (e.key === " " || e.key === "Enter") input.serve = true;
      else return;
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") input.left = false;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") input.right = false;
      else if (e.key === "Shift") input.boost = false;
    };

    // The canvas is stretched to the viewport, which can differ from W (min width, small resizes)
    const toGameX = (clientX: number) => (clientX * W) / (canvas.clientWidth || W);

    // A keyup lost while the window was in the background must not leave a key "held"
    const onBlur = () => {
      input.left = input.right = input.boost = false;
    };

    let mouseSeen = false;
    let lastMouseX: number | null = null;
    const onMouseMove = (e: MouseEvent) => {
      // Browsers also fire mousemove when the mouse hasn't moved (same coordinates);
      // honouring those snapped the paddle back under a resting cursor and undid the arrow keys
      if (lastMouseX !== null && Math.abs(e.clientX - lastMouseX) < 1) return;
      lastMouseX = e.clientX;
      input.pointerX = toGameX(e.clientX);
      if (!mouseSeen) {
        mouseSeen = true;
        input.snap = true;
      }
    };
    const onWheel = (e: WheelEvent) => e.preventDefault(); // keep the page behind from scrolling
    const onMouseDown = () => {
      input.serve = true;
    };

    // Touch: drag anywhere to move, a quick tap exits (same as before)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchMoved = false;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      e.preventDefault();
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartTime = performance.now();
      touchMoved = false;
      input.pointerX = toGameX(t.clientX);
      input.snap = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      e.preventDefault();
      input.pointerX = toGameX(t.clientX);
      if (Math.abs(t.clientX - touchStartX) > 14 || Math.abs(t.clientY - touchStartY) > 14) touchMoved = true;
    };
    let scoreTaps: number[] = [];
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return;
      const now = performance.now();
      const tap = !touchMoved && now - touchStartTime < 250;
      // Mid-rally a tap just moves the paddle (tapping where the ball lands is how you
      // play); during the intro and on the result screen a quick tap still exits.
      if (g.phase !== "play" && tap) {
        exit();
        return;
      }
      // Secret on touch: triple-tap your score (top left) to arm a bomb, once per match
      if (tap && toGameX(touchStartX) < Math.min(W * 0.5, 200) && touchStartY < (geo.narrow ? 80 : 60)) {
        scoreTaps = [...scoreTaps.filter((t) => now - t < 900), now];
        if (scoreTaps.length >= 3) {
          scoreTaps = [];
          secretBomb();
        }
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      // Give the big offscreen canvases back right away (iOS caps total canvas memory)
      for (const c of [source, screen, bg]) {
        c.width = 0;
        c.height = 0;
      }
    };
  }, [snapshot, exit]);

  // While the game is up, nothing on the page behind it keeps keyboard focus, so a
  // half-written form field can't swallow the keys meant for the paddle.
  // (Refs, so React's dev double-mount doesn't record "nothing focused" or refocus mid-game.)
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const refocusTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(refocusTimerRef.current);
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) {
      prevFocusRef.current = active;
      active.blur();
    }
    return () => {
      // Next tick: the page behind is still inert while this unmounts, and inert content can't take focus
      refocusTimerRef.current = setTimeout(() => {
        const prev = prevFocusRef.current;
        if (prev?.isConnected) prev.focus({ preventScroll: true });
      }, 0);
    };
  }, []);

  const headline = result ? (result.winner === "player" ? "YOU WIN!" : result.winner === "cpu" ? "CPU WINS" : "DRAW") : "";
  const hardShadow = "4px 4px 0 #000";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screensaver game"
      className={pixelFont.className}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#06070b" }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "none", touchAction: "none", imageRendering: "pixelated" }}
      />
      <button
        type="button"
        onClick={exit}
        aria-label="Exit game and return to the website"
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border-2 border-white bg-black text-xs leading-none text-white hover:bg-[#222]"
        style={{ cursor: "pointer", boxShadow: hardShadow }}
      >
        X
      </button>
      {result && (
        <div className="absolute inset-0 flex items-center justify-center p-4" style={{ cursor: "default" }}>
          <div
            className="w-full max-w-sm border-4 border-white bg-[#08090e] p-5 text-center text-white"
            style={{ boxShadow: "8px 8px 0 #000" }}
          >
            <p className="text-[8px] leading-relaxed text-white/70">SCREEN DESTROYED</p>
            <h2
              className="mt-3 text-2xl leading-tight"
              style={{ color: result.winner === "player" ? PLAYER_COLOR : result.winner === "cpu" ? CPU_COLOR : "#ffffff", textShadow: "3px 3px 0 #000" }}
            >
              {headline}
            </h2>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <span style={{ color: PLAYER_COLOR }}>YOU {result.player}</span>
              <span style={{ color: CPU_COLOR }}>CPU {result.cpu}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-left text-[9px] leading-relaxed text-white/85">
              <dt>GLASS SMASHED</dt>
              <dd className="text-right">
                {result.playerShards} / {result.cpuShards}
              </dd>
              <dt>PADDLES KO&apos;D</dt>
              <dd className="text-right">{result.kos}</dd>
              <dt>BEST COMBO</dt>
              <dd className="text-right">{result.bestCombo}</dd>
              <dt>TOP SPEED</dt>
              <dd className="text-right">{result.topSpeed} KM/H</dd>
            </dl>
            <div className="mt-6 flex gap-3 text-[10px]">
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur(); // keep keyboard focus off the button so the arrows drive the paddle
                  restartRef.current();
                }}
                className="flex-1 border-2 border-black px-3 py-3 text-black"
                style={{ background: PLAYER_COLOR, cursor: "pointer", boxShadow: hardShadow }}
              >
                PLAY AGAIN
              </button>
              <button
                type="button"
                onClick={exit}
                className="flex-1 border-2 border-white bg-black px-3 py-3 text-white hover:bg-[#222]"
                style={{ cursor: "pointer", boxShadow: hardShadow }}
              >
                BACK TO SITE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
