# toolcaholic

Image tool wheel. Drop a png, jpg or gif, pick a tool off the radial wheel, save the result.

Everything runs in the browser. No uploads, no server work.

## tools

- **convert** — png ⇄ jpg ⇄ gif (gif keeps animation, 256 colors)
- **compress** — quality + scale, same format
- **resize** — exact pixels, locked ratio, quick presets
- **rotate** — quarter turns, flip h/v, live preview
- **crop** — ratio presets, zoom, pan, preview
- **frames** — pull every gif frame out as png

Animated gifs keep all frames through resize, rotate, crop and compress.

## run

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## stack

Next.js 16 (App Router), React 19, Tailwind 4, canvas 2D, `gifuct-js` + `gifenc` for gif frames.
