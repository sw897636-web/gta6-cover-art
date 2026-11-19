// Neon Coast Cover Studio — editor wiring.
//
// Owns the page state (layout, grade, caption, photos, per-panel crop) and
// connects every control to the live preview canvas. Photos are read on this
// machine with FileReader and never leave it. The cover the preview shows is
// the same drawing the exporter writes, so what you see is the PNG you get.

import { LAYOUTS, layoutById, panelCount } from './layouts.js';
import { GRADES, gradeById } from './grades.js';
import { drawCover } from './cover.js';
import { EXPORT_SIZES, exportSizeById, exportCoverPng, downloadBlob, exportFilename } from './export.js';
import { readShotPreset, shotSizeId } from './shots.js';

const SAMPLES = [
  { name: 'Boulevard', src: 'samples/boulevard.jpg' },
  { name: 'Pier', src: 'samples/pier.jpg' },
];

const state = {
  layoutId: 'hero-strip',
  gradeId: 'sunset',
  title: 'Sunset Heist',
  subtitle: 'Vice City nights, our rules',
  photos: [],
  panelPhotos: [],
  zooms: [],
  ox: [],
  oy: [],
  sizeId: 'wide',
  selectedPanel: 0,
};

const $ = (id) => document.getElementById(id);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

async function addPhoto(name, src) {
  const img = await loadImage(src);
  const photo = { name, src, img };
  state.photos.push(photo);
  return state.photos.length - 1;
}

function ensurePanelArrays() {
  const count = panelCount(state.layoutId);
  while (state.panelPhotos.length < count) {
    const fallback = state.photos.length > 0 ? 0 : -1;
    state.panelPhotos.push(fallback);
    state.zooms.push(1);
    state.ox.push(0);
    state.oy.push(0);
  }
  state.panelPhotos.length = count;
  state.zooms.length = count;
  state.ox.length = count;
  state.oy.length = count;
  if (state.selectedPanel >= count) state.selectedPanel = 0;
}

function previewSize() {
  const size = exportSizeById(state.sizeId);
  const longest = 960;
  const scale = longest / Math.max(size.width, size.height);
  return {
    width: Math.round(size.width * scale),
    height: Math.round(size.height * scale),
  };
}

export function renderPreview() {
  const canvas = $('preview');
  if (!canvas) return;
  const { width, height } = previewSize();
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  ensurePanelArrays();
  drawCover(ctx, width, height, state);
}

function pointInPanel(fx, fy, panel) {
  if (panel.poly) {
    let inside = false;
    for (let a = 0, b = panel.poly.length - 1; a < panel.poly.length; b = a, a += 1) {
      const [ax, ay] = panel.poly[a];
      const [bx, by] = panel.poly[b];
      if ((ay > fy) !== (by > fy) && fx < ((bx - ax) * (fy - ay)) / (by - ay) + ax) inside = !inside;
    }
    return inside;
  }
  return fx >= panel.x && fx < panel.x + panel.w && fy >= panel.y && fy < panel.y + panel.h;
}

function pickPanelAt(clientX, clientY) {
  const canvas = $('preview');
  const box = canvas.getBoundingClientRect();
  const fx = (clientX - box.left) / box.width;
  const fy = (clientY - box.top) / box.height;
  const panels = layoutById(state.layoutId).panels();
  for (let i = panels.length - 1; i >= 0; i -= 1) {
    if (pointInPanel(fx, fy, panels[i])) return i;
  }
  return -1;
}

function refreshPanelControls() {
  ensurePanelArrays();
  const i = state.selectedPanel;
  $('panelLabel').textContent = `Panel ${i + 1} of ${state.panelPhotos.length}`;
  const select = $('panelPhoto');
  select.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '-1';
  empty.textContent = 'Empty panel';
  select.appendChild(empty);
  state.photos.forEach((photo, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = photo.name;
    select.appendChild(option);
  });
  select.value = String(state.panelPhotos[i]);
  $('zoomSlider').value = String(state.zooms[i]);
  $('panXSlider').value = String(state.ox[i]);
  $('panYSlider').value = String(state.oy[i]);
  $('zoomValue').textContent = `${state.zooms[i].toFixed(2)}×`;
  document.querySelectorAll('#photoList .thumb').forEach((thumb, index) => {
    thumb.classList.toggle('active', state.panelPhotos[i] === index);
  });
}

function refreshPhotoList() {
  const list = $('photoList');
  list.innerHTML = '';
  state.photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    button.title = photo.name;
    const thumb = document.createElement('img');
    thumb.src = photo.src;
    thumb.alt = photo.name;
    button.appendChild(thumb);
    button.addEventListener('click', () => {
      ensurePanelArrays();
      state.panelPhotos[state.selectedPanel] = index;
      refreshPanelControls();
      renderPreview();
    });
    list.appendChild(button);
  });
  refreshPanelControls();
}

function buildPicker(containerId, items, activeId, onPick) {
  const container = $(containerId);
  container.innerHTML = '';
  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.dataset.id = item.id;
    button.textContent = item.name;
    if (item.blurb) button.title = item.blurb;
    if (item.id === activeId) button.classList.add('active');
    button.addEventListener('click', () => {
      container.querySelectorAll('.pick').forEach((el) => el.classList.remove('active'));
      button.classList.add('active');
      onPick(item.id);
    });
    container.appendChild(button);
  });
}

function buildLayoutPicker() {
  buildPicker('layoutPicker', LAYOUTS, state.layoutId, (id) => {
    state.layoutId = id;
    ensurePanelArrays();
    refreshPanelControls();
    renderPreview();
  });
}

function buildGradePicker() {
  buildPicker('gradePicker', GRADES, state.gradeId, (id) => {
    state.gradeId = id;
    renderPreview();
  });
}

function buildSizePicker() {
  buildPicker('sizePicker', EXPORT_SIZES, state.sizeId, (id) => {
    state.sizeId = id;
    renderPreview();
  });
}

async function handleUpload(files) {
  const picked = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
  for (const file of picked) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('could not read file'));
      reader.readAsDataURL(file);
    });
    await addPhoto(file.name.replace(/\.[^.]+$/, ''), dataUrl);
  }
  if (picked.length > 0) {
    ensurePanelArrays();
    state.panelPhotos[state.selectedPanel] = state.photos.length - 1;
    refreshPhotoList();
    renderPreview();
  }
}

function fillAllPanelsWithSelected() {
  ensurePanelArrays();
  const photo = state.panelPhotos[state.selectedPanel];
  state.panelPhotos = state.panelPhotos.map(() => photo);
  refreshPanelControls();
  renderPreview();
}

async function exportCurrentSize() {
  const size = exportSizeById(state.sizeId);
  const button = $('exportBtn');
  button.disabled = true;
  button.textContent = 'Exporting…';
  try {
    const blob = await exportCoverPng(state, size.width, size.height);
    downloadBlob(blob, exportFilename(state, size));
    $('exportNote').textContent = `Saved ${size.width} × ${size.height} PNG — check your downloads.`;
  } finally {
    button.disabled = false;
    button.textContent = 'Export PNG';
  }
}

function applyPreset(preset) {
  if (preset.caption) state.title = preset.caption;
  if (preset.subtitle) state.subtitle = preset.subtitle;
  if (preset.layoutId && LAYOUTS.some((entry) => entry.id === preset.layoutId)) {
    state.layoutId = preset.layoutId;
  }
  if (preset.gradeId && GRADES.some((entry) => entry.id === preset.gradeId)) {
    state.gradeId = preset.gradeId;
  }
  state.sizeId = shotSizeId(preset);
  if (preset.photo) {
    const index = state.photos.findIndex((photo) => photo.name.toLowerCase() === preset.photo.toLowerCase());
    if (index >= 0) {
      ensurePanelArrays();
      state.panelPhotos = state.panelPhotos.map(() => index);
    }
  }
  if (preset.oy !== '' && Number.isFinite(Number(preset.oy))) {
    ensurePanelArrays();
    state.oy = state.oy.map(() => Number(preset.oy));
  }
  if (preset.coverOnly) document.body.classList.add('shot-cover');
}

async function init() {
  const preset = readShotPreset(window.location.search);
  buildLayoutPicker();
  buildGradePicker();
  buildSizePicker();

  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('titleInput').addEventListener('input', (event) => {
    state.title = event.target.value;
    renderPreview();
  });
  $('subtitleInput').addEventListener('input', (event) => {
    state.subtitle = event.target.value;
    renderPreview();
  });

  $('panelPhoto').addEventListener('change', (event) => {
    ensurePanelArrays();
    state.panelPhotos[state.selectedPanel] = Number(event.target.value);
    refreshPanelControls();
    renderPreview();
  });
  $('zoomSlider').addEventListener('input', (event) => {
    state.zooms[state.selectedPanel] = Number(event.target.value);
    refreshPanelControls();
    renderPreview();
  });
  $('panXSlider').addEventListener('input', (event) => {
    state.ox[state.selectedPanel] = Number(event.target.value);
    renderPreview();
  });
  $('panYSlider').addEventListener('input', (event) => {
    state.oy[state.selectedPanel] = Number(event.target.value);
    renderPreview();
  });

  $('preview').addEventListener('click', (event) => {
    const picked = pickPanelAt(event.clientX, event.clientY);
    if (picked >= 0) {
      state.selectedPanel = picked;
      refreshPanelControls();
    }
  });

  $('uploadBtn').addEventListener('click', () => $('uploadInput').click());
  $('uploadInput').addEventListener('change', (event) => {
    handleUpload(event.target.files).catch(() => {
      $('exportNote').textContent = 'That file could not be read as a photo.';
    });
    event.target.value = '';
  });
  $('fillAllBtn').addEventListener('click', fillAllPanelsWithSelected);
  $('exportBtn').addEventListener('click', () => {
    exportCurrentSize().catch(() => {
      $('exportNote').textContent = 'Export failed — try again.';
    });
  });

  for (const sample of SAMPLES) {
    try {
      await addPhoto(sample.name, sample.src);
    } catch {
      // A missing sample just leaves the panel empty; the app still works.
    }
  }
  ensurePanelArrays();
  state.panelPhotos = state.panelPhotos.map((value, i) => (value < 0 ? i % Math.max(1, state.photos.length) : value));
  applyPreset(preset);
  buildLayoutPicker();
  buildGradePicker();
  buildSizePicker();
  refreshPhotoList();
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;

  try {
    await Promise.all([
      document.fonts.load('80px Anton'),
      document.fonts.load('40px Bangers'),
      document.fonts.ready,
    ]);
  } catch {
    // System fallbacks still render; the cover stays usable.
  }
  renderPreview();

  window.__neonCoast = {
    state,
    renderPreview,
    exportCoverPng: (width, height) => exportCoverPng(state, width, height),
    ready: true,
  };
}

init();
