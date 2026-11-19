// Neon Coast Cover Studio — colour grades.
//
// A grade is a sunset / neon treatment applied over the photos: a CSS filter
// for the photo pixels, a top-to-bottom overlay gradient drawn in 'overlay'
// mode, a glow colour for the sun disc, and the caption palette. Nothing here
// is a Rockstar asset — these are plain colour values picked for the app.

export const GRADES = [
  {
    id: 'sunset',
    name: 'Vice Sunset',
    blurb: 'Orange sky melting into violet.',
    photoFilter: 'saturate(1.45) contrast(1.08) brightness(1.02)',
    overlayTop: '#ff9a3d',
    overlayBottom: '#3b1a6e',
    overlayAlpha: 0.5,
    glow: '#ff8c42',
    titleTop: '#fff7e6',
    titleBottom: '#ffc46b',
    subtitle: '#ffd166',
    tag: '#ffffff',
  },
  {
    id: 'neon',
    name: 'Neon Pink / Blue',
    blurb: 'Hot pink against electric blue.',
    photoFilter: 'saturate(1.6) contrast(1.12) brightness(1.0)',
    overlayTop: '#ff2e88',
    overlayBottom: '#00b3ff',
    overlayAlpha: 0.55,
    glow: '#ff5db1',
    titleTop: '#ffffff',
    titleBottom: '#ff9ecf',
    subtitle: '#7fe7ff',
    tag: '#ffffff',
  },
  {
    id: 'dusk',
    name: 'Dusk Teal',
    blurb: 'Cool teal evening, warm horizon.',
    photoFilter: 'saturate(1.25) contrast(1.1) brightness(0.98)',
    overlayTop: '#ffb347',
    overlayBottom: '#0f5e6e',
    overlayAlpha: 0.5,
    glow: '#ffc46b',
    titleTop: '#f2feff',
    titleBottom: '#8fe3ef',
    subtitle: '#ffd166',
    tag: '#eafcff',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    blurb: 'Low warm sun, honey highlights.',
    photoFilter: 'saturate(1.5) contrast(1.05) brightness(1.05) sepia(0.18)',
    overlayTop: '#ffd76b',
    overlayBottom: '#b34700',
    overlayAlpha: 0.45,
    glow: '#ffe08a',
    titleTop: '#fffbe8',
    titleBottom: '#ffcf5c',
    subtitle: '#fff3c4',
    tag: '#ffffff',
  },
  {
    id: 'noir',
    name: 'Mono Noir',
    blurb: 'Black-and-white crime poster.',
    photoFilter: 'grayscale(1) contrast(1.25) brightness(1.03)',
    overlayTop: '#e8e8e8',
    overlayBottom: '#111111',
    overlayAlpha: 0.35,
    glow: '#f5f5f5',
    titleTop: '#ffffff',
    titleBottom: '#c9c9c9',
    subtitle: '#ff5d5d',
    tag: '#dddddd',
  },
];

export function gradeById(id) {
  return GRADES.find((entry) => entry.id === id) ?? GRADES[0];
}
