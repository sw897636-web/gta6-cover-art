# Neon Coast Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sw897636-web/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sw897636-web/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your own photo and a caption into GTA-style multi-panel cover art, and
export it as a PNG to share. An original design — no Rockstar Games logo,
wordmark, artwork, character or font is used anywhere.

## What it does

- **Any photo:** upload your own photos (read in the browser with FileReader,
  they never leave your machine), or use the two built-in sample photos.
  Crop and position each photo per panel with zoom and pan sliders; fill
  several panels with one photo, or a different photo per panel.
- **5 layouts:** Hero + Strip, Triple Split, Mosaic Four, Full Bleed + Inset,
  and a Diagonal Split — multi-panel poster grids, click any panel in the
  preview to select it.
- **5 grades:** Vice Sunset, Neon Pink / Blue, Dusk Teal, Golden Hour, and
  Mono Noir — sunset and neon colour washes, a striped sunset sun, vignette,
  white gutters and frame.
- **Caption:** editable title in bold Anton lettering with a gradient fill
  and outline, plus a Bangers subtitle/tagline.
- **Fast and easy:** photo to PNG in a few clicks, with a live preview that
  is the exact drawing the export writes.
- **Export PNG in the 3 common post sizes:** 1080 × 1080, 1080 × 1350, and
  1920 × 1080.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network at runtime: every script, font and image the app
loads is a file under `app/`. It works offline in desktop Chrome.

## Files

- `app/index.html` — the editor page
- `app/style.css` — editor styles
- `app/src/main.js` — editor state and controls
- `app/src/cover.js` — the cover renderer (panels, grade, sun, caption)
- `app/src/layouts.js` — the 5 poster layouts
- `app/src/grades.js` — the 5 colour grades
- `app/src/export.js` — PNG export at the 3 post sizes
- `app/src/shots.js` — URL presets for screenshots
- `app/fonts/` — Anton and Bangers (SIL Open Font License, see `OFL.txt`)
- `app/samples/` — two sample photos made with an image model for make.fun
- `main.ts` — hands the app in (copies `app/` + `screenshots/`, writes `dossier.json`)
- `serve.ts` — tiny static server for local testing

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`. Fonts are under the SIL Open Font License 1.1
(`app/fonts/OFL.txt`).
