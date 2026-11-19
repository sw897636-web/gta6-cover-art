// Neon Coast Cover Studio — PNG export.
//
// The exporter renders the same drawCover the preview uses, onto a fresh
// canvas at exactly one of the three common post sizes, then hands the PNG
// back as a Blob so the browser can download it. No upload, no server.

import { drawCover } from './cover.js';

export const EXPORT_SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', width: 1080, height: 1350 },
  { id: 'wide', label: 'Landscape · 1920 × 1080', width: 1920, height: 1080 },
];

export function exportSizeById(id) {
  return EXPORT_SIZES.find((entry) => entry.id === id) ?? EXPORT_SIZES[2];
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG export failed'));
    }, 'image/png');
  });
}

export async function exportCoverPng(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawCover(ctx, width, height, state);
  return canvasToBlob(canvas);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function exportFilename(state, size) {
  const slug = (state.title || 'neon-coast')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'neon-coast';
  return `${slug}-${size.width}x${size.height}.png`;
}
