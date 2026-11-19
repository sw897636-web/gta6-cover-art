// Neon Coast Cover Studio — poster panel layouts.
//
// A layout turns any canvas size into a list of photo panels. Every panel is
// a rectangle given as fractions of the canvas (x, y, w, h), plus an optional
// polygon (poly) of fractional [x, y] corners for a diagonal cut. The caption
// field says where the title band sits: 'bottom' or 'top'.

export const LAYOUTS = [
  {
    id: 'hero-strip',
    name: 'Hero + Strip',
    blurb: 'One big hero photo over a three-photo strip.',
    caption: 'bottom',
    panels() {
      return [
        { x: 0, y: 0, w: 1, h: 0.64 },
        { x: 0, y: 0.64, w: 1 / 3, h: 0.36 },
        { x: 1 / 3, y: 0.64, w: 1 / 3, h: 0.36 },
        { x: 2 / 3, y: 0.64, w: 1 / 3, h: 0.36 },
      ];
    },
  },
  {
    id: 'trio',
    name: 'Triple Split',
    blurb: 'Three tall panels side by side.',
    caption: 'bottom',
    panels() {
      return [
        { x: 0, y: 0, w: 1 / 3, h: 1 },
        { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
        { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
      ];
    },
  },
  {
    id: 'mosaic',
    name: 'Mosaic Four',
    blurb: 'A big feature panel with three smaller ones.',
    caption: 'bottom',
    panels() {
      return [
        { x: 0, y: 0, w: 0.6, h: 0.62 },
        { x: 0.6, y: 0, w: 0.4, h: 0.31 },
        { x: 0.6, y: 0.31, w: 0.4, h: 0.31 },
        { x: 0, y: 0.62, w: 1, h: 0.38 },
      ];
    },
  },
  {
    id: 'fullbleed-inset',
    name: 'Full Bleed + Inset',
    blurb: 'One photo fills the poster, a second floats inside it.',
    caption: 'top',
    panels() {
      return [
        { x: 0, y: 0, w: 1, h: 1 },
        { x: 0.58, y: 0.56, w: 0.36, h: 0.36 },
      ];
    },
  },
  {
    id: 'diagonal',
    name: 'Diagonal Split',
    blurb: 'Two photos cut apart on a slant.',
    caption: 'bottom',
    panels() {
      return [
        {
          x: 0, y: 0, w: 1, h: 1,
          poly: [[0, 0], [1, 0], [0.58, 1], [0, 1]],
        },
        {
          x: 0, y: 0, w: 1, h: 1,
          poly: [[1, 0], [1, 1], [0.58, 1]],
        },
      ];
    },
  },
];

export function layoutById(id) {
  return LAYOUTS.find((entry) => entry.id === id) ?? LAYOUTS[0];
}

export function panelCount(layoutId) {
  return layoutById(layoutId).panels().length;
}
