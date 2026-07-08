const CAPTIONS = [
  'The moment my world became brighter ✦',
  'Your smile — my favorite constellation',
  'Every glance, a love letter unwritten',
  'Pink sunsets and blue horizons, because of you',
  'In your eyes, I found my forever',
  'A birthday queen, a heart\'s delight',
  'Soft light, softer love',
  'You paint my sky in colors I never knew',
  'This is what happiness looks like',
  'My muse, my melody, my everything',
  'Captured light, eternal love',
  'The art of loving you',
  'Moments that time can never steal',
  'Your laughter echoes in my soul',
  'Beautiful inside and out',
  'A chapter I never want to end',
  'My heart chose you, again and again',
  'Forever starts with you',
  'The most beautiful story ever told',
];

export const PHOTOS = Array.from({ length: 19 }, (_, i) => ({
  src: `./photos/eva-${String(i + 1).padStart(2, '0')}.png`,
  caption: CAPTIONS[i % CAPTIONS.length],
}));

export const SONG = {
  id: 'q29MxRthrVM',
  title: 'Our Song ♡',
};

export const CONTACT_EMAIL = 'yourlove@evabharati.com';
