import type { ToolId } from "./types";

export type Tool = { id: ToolId; name: string; hint: string };

export const TOOLS: Tool[] = [
  { id: "convert", name: "convert", hint: "png · jpg · gif" },
  { id: "compress", name: "compress", hint: "shrink bytes, keep look" },
  { id: "resize", name: "resize", hint: "exact pixels, locked ratio" },
  { id: "rotate", name: "rotate", hint: "quarter turns, mirrors" },
  { id: "crop", name: "crop", hint: "ratio preset, pan, zoom" },
  { id: "frames", name: "frames", hint: "gif frames out" },
];
