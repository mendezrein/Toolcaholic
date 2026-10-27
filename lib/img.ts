import { encodeGif, gifFrames } from "./gif";
import type { Fmt, Src } from "./types";

export const MIME: Record<Fmt, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  gif: "image/gif",
};

export const EXT: Record<Fmt, string> = { png: "png", jpeg: "jpg", gif: "gif" };

export function fmtOf(type: string): Fmt {
  if (type === "image/jpeg") return "jpeg";
  if (type === "image/gif") return "gif";
  return "png";
}

export function fmtSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").toLowerCase();
}

export function canvasOf(w: number, h: number, draw?: ImageBitmap): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(w));
  cv.height = Math.max(1, Math.round(h));
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  if (draw) {
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(draw, 0, 0, cv.width, cv.height);
  }
  return cv;
}

export function baseCanvas(src: Src): HTMLCanvasElement {
  return canvasOf(src.w, src.h, src.bmp);
}

export async function loadSrc(file: File): Promise<Src> {
  const bmp = await createImageBitmap(file);
  return {
    file,
    url: URL.createObjectURL(file),
    bmp,
    w: bmp.width,
    h: bmp.height,
    fmt: fmtOf(file.type),
    size: file.size,
    gif: file.type === "image/gif",
  };
}

export async function encode(cv: HTMLCanvasElement, fmt: Fmt, q = 0.92): Promise<Blob> {
  if (fmt === "gif") return encodeGif([{ canvas: cv, delay: 100 }]);
  return new Promise((res, rej) => {
    cv.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), MIME[fmt], q);
  });
}

export function scaleTo(img: CanvasImageSource, w: number, h: number): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(w));
  cv.height = Math.max(1, Math.round(h));
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, cv.width, cv.height);
  return cv;
}

export function rotateImg(
  img: CanvasImageSource,
  w: number,
  h: number,
  deg: number,
  fh: boolean,
  fv: boolean,
): HTMLCanvasElement {
  const swap = Math.abs(deg) % 180 !== 0;
  const cv = document.createElement("canvas");
  cv.width = swap ? h : w;
  cv.height = swap ? w : h;
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.imageSmoothingQuality = "high";
  ctx.translate(cv.width / 2, cv.height / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.scale(fh ? -1 : 1, fv ? -1 : 1);
  ctx.drawImage(img, -w / 2, -h / 2);
  return cv;
}

export function cropRect(w: number, h: number, ratio: number | null, zoom: number, ox: number, oy: number) {
  let sw = w / zoom;
  let sh = ratio ? sw / ratio : h / zoom;
  if (sh > h) {
    sh = h;
    sw = ratio ? sh * ratio : w / zoom;
  }
  const slackX = w - sw;
  const slackY = h - sh;
  const sx = Math.min(slackX, Math.max(0, slackX / 2 + (ox * slackX) / 2));
  const sy = Math.min(slackY, Math.max(0, slackY / 2 + (oy * slackY) / 2));
  return { sw, sh, sx, sy, slackX, slackY };
}

export function cropImg(
  img: CanvasImageSource,
  w: number,
  h: number,
  ratio: number | null,
  zoom: number,
  ox: number,
  oy: number,
): HTMLCanvasElement {
  const { sw, sh, sx, sy } = cropRect(w, h, ratio, zoom, ox, oy);
  const cv = document.createElement("canvas");
  cv.width = Math.round(sw);
  cv.height = Math.round(sh);
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
  return cv;
}

export async function animated(
  src: Src,
  map: (cv: HTMLCanvasElement) => HTMLCanvasElement,
): Promise<{ blob: Blob; w: number; h: number }> {
  const frames = await gifFrames(src.file);
  const out = frames.map((f) => ({ canvas: map(f.canvas), delay: f.delay }));
  return { blob: encodeGif(out), w: out[0].canvas.width, h: out[0].canvas.height };
}
