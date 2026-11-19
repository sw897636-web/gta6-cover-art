// Neon Coast Cover Studio — screenshot presets.
//
// A preset is a URL query the maker uses to set the app up for a screenshot:
// which sample photo, which caption, layout and grade, and whether the page
// shows the full editor or just the cover. applyShotPreset reads the query
// and returns the state overrides plus the display mode; main.js applies them.

export function readShotPreset(search) {
  const params = new URLSearchParams(search || '');
  const shot = params.get('shot') || '';
  return {
    shot,
    coverOnly: shot.startsWith('cover'),
    photo: params.get('photo') || '',
    caption: params.get('caption') || '',
    subtitle: params.get('subtitle') || '',
    layoutId: params.get('layout') || '',
    gradeId: params.get('grade') || '',
    sizeId: params.get('size') || '',
    oy: params.get('oy') || '',
  };
}

export function shotSizeId(preset) {
  if (preset.shot === 'cover-square') return 'square';
  if (preset.shot === 'cover-portrait') return 'portrait';
  if (preset.shot === 'cover') return 'wide';
  return preset.sizeId || 'wide';
}
