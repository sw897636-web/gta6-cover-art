// Neon Coast Cover Studio — cover renderer.
//
// drawCover paints one poster onto a 2d canvas of any size from the editor
// state: panel photos (cover-fit, per-panel zoom and offset), the grade, a
// striped sunset sun, white gutters and frame, and the bold caption lettering.
// It is also what the PNG exporter calls, so the preview and the export are
// the same drawing at different sizes.

import { layoutById } from './layouts.js';
import { gradeById } from './grades.js';

function panelPixels(panel, width, height) {
  return {
    x: panel.x * width,
    y: panel.y * height,
    w: panel.w * width,
    h: panel.h * height,
  };
}

function tracePanel(ctx, panel, width, height) {
  ctx.beginPath();
  if (panel.poly) {
    panel.poly.forEach(([fx, fy], i) => {
      const px = fx * width;
      const py = fy * height;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
  } else {
    const r = panelPixels(panel, width, height);
    ctx.rect(r.x, r.y, r.w, r.h);
  }
}

// Draw one photo cover-fit inside a panel, honouring zoom (1 = fit) and the
// fractional offsets ox / oy, which slide the photo inside its frame.
export function drawPanelPhoto(ctx, img, panel, width, height, zoom, ox, oy, filter) {
  const rect = panelPixels(panel, width, height);
  ctx.save();
  tracePanel(ctx, panel, width, height);
  ctx.clip();
  if (filter) ctx.filter = filter;
  const fit = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const scale = fit * (zoom || 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = rect.x + (rect.w - dw) / 2 + (ox || 0) * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + (oy || 0) * rect.h;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function fillEmptyPanel(ctx, panel, width, height, grade) {
  const rect = panelPixels(panel, width, height);
  ctx.save();
  tracePanel(ctx, panel, width, height);
  ctx.clip();
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  grad.addColorStop(0, grade.overlayTop);
  grad.addColorStop(1, grade.overlayBottom);
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

// A sunset sun with horizontal slits. The disc is cut on a scratch canvas
// first (so the slits never erase the photos underneath), then stamped over
// the poster in 'screen' mode so it glows.
export function drawSun(ctx, cx, cy, radius, colour) {
  const size = Math.ceil(radius * 2 + 4);
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const o = off.getContext('2d');
  o.fillStyle = colour;
  o.beginPath();
  o.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  o.fill();
  o.globalCompositeOperation = 'destination-out';
  const slits = 4;
  for (let i = 0; i < slits; i += 1) {
    const y = size / 2 + radius * (-0.05 + i * 0.24);
    const half = Math.sqrt(Math.max(0, radius * radius - (y - size / 2) * (y - size / 2)));
    o.fillRect(size / 2 - half, y, half * 2, radius * 0.05);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.9;
  ctx.drawImage(off, cx - size / 2, cy - size / 2);
  ctx.restore();
}

function applyGradeWash(ctx, width, height, grade) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = grade.overlayAlpha;
  const wash = ctx.createLinearGradient(0, 0, 0, height);
  wash.addColorStop(0, grade.overlayTop);
  wash.addColorStop(1, grade.overlayBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function applyVignette(ctx, width, height) {
  ctx.save();
  const glow = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.35,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawGutters(ctx, panels, width, height) {
  const line = Math.max(3, Math.round(width * 0.004));
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = line;
  ctx.lineJoin = 'miter';
  panels.forEach((panel) => {
    tracePanel(ctx, panel, width, height);
    ctx.stroke();
  });
  ctx.lineWidth = line * 1.6;
  ctx.strokeRect(line, line, width - line * 2, height - line * 2);
  ctx.restore();
}

function fitTitleSize(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  }
  return size;
}

// The caption band: a dark scrim, the big Anton title with a black outline
// and a warm gradient fill, the Bangers subtitle, and a small tag line.
export function drawCaption(ctx, width, height, state, grade, where) {
  const title = (state.title || 'NEON COAST').toUpperCase();
  const subtitle = state.subtitle || '';
  const bandH = height * 0.24;
  const bandY = where === 'top' ? 0 : height - bandH;
  ctx.save();
  const scrim = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  if (where === 'top') {
    scrim.addColorStop(0, 'rgba(8,4,20,0.82)');
    scrim.addColorStop(1, 'rgba(8,4,20,0)');
  } else {
    scrim.addColorStop(0, 'rgba(8,4,20,0)');
    scrim.addColorStop(1, 'rgba(8,4,20,0.86)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY, width, bandH);

  const pad = width * 0.045;
  const maxText = width - pad * 2;
  const titleSize = fitTitleSize(ctx, title, maxText, Math.round(height * 0.105));
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = `${Math.round(titleSize * 0.02)}px`; } catch { /* older canvas */ }
  const titleGrad = ctx.createLinearGradient(0, bandY, 0, bandY + titleSize * 1.4);
  titleGrad.addColorStop(0, grade.titleTop);
  titleGrad.addColorStop(1, grade.titleBottom);
  const titleY = where === 'top'
    ? bandY + titleSize * 1.05
    : height - height * 0.075 - (subtitle ? height * 0.045 : 0);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(10,5,25,0.95)';
  ctx.lineWidth = Math.max(3, titleSize * 0.09);
  ctx.strokeText(title, pad, titleY);
  ctx.fillStyle = titleGrad;
  ctx.fillText(title, pad, titleY);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }

  if (subtitle) {
    const subSize = Math.round(height * 0.042);
    ctx.font = `${subSize}px Bangers, 'Comic Sans MS', cursive`;
    ctx.fillStyle = grade.subtitle;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = Math.round(subSize * 0.25);
    ctx.shadowOffsetY = 2;
    const subY = where === 'top' ? titleY + subSize * 1.5 : height - height * 0.028;
    ctx.fillText(subtitle, pad, subY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  const tagSize = Math.max(13, Math.round(height * 0.016));
  ctx.font = `700 ${tagSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = grade.tag;
  ctx.globalAlpha = 0.9;
  const tag = 'NEON COAST  •  COVER STUDIO';
  const tagW = ctx.measureText(tag).width;
  // The tag always sits at the poster's foot: clear of the title row above
  // and of the sun disc, and below the inset panel on full-bleed layouts.
  const tagY = height - height * 0.012;
  ctx.fillText(tag, width - pad - tagW, tagY);
  ctx.restore();
}

export function drawCover(ctx, width, height, state) {
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);
  const panels = layout.panels();
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, width, height);
  panels.forEach((panel, i) => {
    const photoIndex = state.panelPhotos ? state.panelPhotos[i] : -1;
    const entry = photoIndex >= 0 && state.photos ? state.photos[photoIndex] : null;
    // A photo entry is { name, src, img }; accept a bare image too.
    const img = entry && entry.img ? entry.img : entry;
    if (img && img.complete && img.naturalWidth > 0) {
      drawPanelPhoto(
        ctx, img, panel, width, height,
        state.zooms ? state.zooms[i] || 1 : 1,
        state.ox ? state.ox[i] || 0 : 0,
        state.oy ? state.oy[i] || 0 : 0,
        grade.photoFilter,
      );
    } else {
      fillEmptyPanel(ctx, panel, width, height, grade);
    }
  });
  const sunR = Math.min(width, height) * 0.085;
  drawSun(ctx, width * 0.8, height * 0.17, sunR, grade.glow);
  applyGradeWash(ctx, width, height, grade);
  applyVignette(ctx, width, height);
  drawGutters(ctx, panels, width, height);
  drawCaption(ctx, width, height, state, grade, layout.caption);
  ctx.restore();
}
