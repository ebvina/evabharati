const CAPTIONS = [
  'Somewhere, a star learned to smile ✦',
  'Her smile — a constellation of its own',
  'The universe showing off, quietly',
  'Pink sunsets and blue horizons, all in one person',
  'Some light was never meant to be reached',
  'A birthday written in stardust',
  'Soft light, softer soul',
  'She paints the sky in colors it never knew',
  'This is what starlight looks like up close',
  'A galaxy, casually walking by',
  'Captured light, endless wonder',
  'The universe took its time with her',
  'Moments that time keeps for itself',
  'Even gravity bends a little around her',
  'Beautiful, the way distant stars are',
  'A chapter the sky wrote alone',
  'Some hearts admire from lightyears away',
  'Forever looks something like this',
  'The most beautiful story the sky ever told',
];

export const PHOTOS = Array.from({ length: 19 }, (_, i) => ({
  src: `./photos/eva-${String(i + 1).padStart(2, '0')}.png`,
  caption: CAPTIONS[i % CAPTIONS.length],
}));

export const SONGS = [
  { id: 'Qaj2TceZGGU', title: 'Song for Her ♡' },
  { id: '0_sZlZn8aLY', title: 'Song for Her ♡' },
  { id: '_Tk9_kPpO1U', title: 'Song for Her ♡' },
  { id: 'DZ4BtMpaJaU', title: 'Song for Her ♡' },
  { id: 'kEbcHhNsRoU', title: 'Song for Her ♡' },
];

export const CONTACT_EMAIL = 'yourlove@evabharati.com';
