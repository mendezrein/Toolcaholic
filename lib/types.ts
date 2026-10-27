export type Fmt = "png" | "jpeg" | "gif";

export type ToolId = "convert" | "compress" | "resize" | "rotate" | "crop" | "frames";

export type Src = {
  file: File;
  url: string;
  bmp: ImageBitmap;
  w: number;
  h: number;
  fmt: Fmt;
  size: number;
  gif: boolean;
};

export type Done = (blob: Blob, w: number, h: number, fmt: Fmt) => void;

export type Res = {
  blob: Blob;
  url: string;
  w: number;
  h: number;
  fmt: Fmt;
  name: string;
};
