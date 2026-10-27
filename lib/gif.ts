import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { parseGIF, decompressFrames } from "gifuct-js";

export type GifFrame = { canvas: HTMLCanvasElement; delay: number };

export async function gifFrames(file: File): Promise<GifFrame[]> {
  const buf = await file.arrayBuffer();
  const gif = parseGIF(buf);
  const frames = decompressFrames(gif, true);
  const w = gif.lsd.width;
  const h = gif.lsd.height;
  const base = document.createElement("canvas");
  base.width = w;
  base.height = h;
  const ctx = base.getContext("2d");
  if (!ctx) throw new Error("no canvas context");

  const out: GifFrame[] = [];
  frames.forEach((f) => {
    if (f.disposalType === 2) ctx.clearRect(f.dims.left, f.dims.top, f.dims.width, f.dims.height);
    const patch = new ImageData(new Uint8ClampedArray(f.patch), f.dims.width, f.dims.height);
    ctx.putImageData(patch, f.dims.left, f.dims.top);
    const snap = document.createElement("canvas");
    snap.width = w;
    snap.height = h;
    const sctx = snap.getContext("2d");
    if (!sctx) throw new Error("no canvas context");
    sctx.drawImage(base, 0, 0);
    out.push({ canvas: snap, delay: f.delay || 100 });
  });
  return out;
}

export function encodeGif(frames: GifFrame[]): Blob {
  const enc = GIFEncoder();
  frames.forEach((f, i) => {
    const ctx = f.canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas context");
    const { data } = ctx.getImageData(0, 0, f.canvas.width, f.canvas.height);
    const palette = quantize(data, 256, { format: "rgba4444" });
    const index = applyPalette(data, palette, "rgba4444");
    enc.writeFrame(index, f.canvas.width, f.canvas.height, {
      palette,
      delay: f.delay,
      first: i === 0,
    });
  });
  enc.finish();
  return new Blob([new Uint8Array(enc.bytes())], { type: "image/gif" });
}
