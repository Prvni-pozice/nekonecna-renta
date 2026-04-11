// Generates iOS app icons for Nekonecna Renta
// Design: dark gradient background, gold infinity symbol + percent sign

const sharp = require('/data/bot/renta/web/node_modules/sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = '/data/bot/renta/ios/NekonecnaRenta/Assets.xcassets/AppIcon.appiconset';

// Icon sizes needed for iOS
const sizes = [
  // iPhone
  { size: 40,   scale: 2, idiom: 'iphone', suffix: 'iphone-20@2x' },
  { size: 60,   scale: 3, idiom: 'iphone', suffix: 'iphone-20@3x' },
  { size: 58,   scale: 2, idiom: 'iphone', suffix: 'iphone-29@2x' },
  { size: 87,   scale: 3, idiom: 'iphone', suffix: 'iphone-29@3x' },
  { size: 80,   scale: 2, idiom: 'iphone', suffix: 'iphone-40@2x' },
  { size: 120,  scale: 3, idiom: 'iphone', suffix: 'iphone-40@3x' },
  { size: 120,  scale: 2, idiom: 'iphone', suffix: 'iphone-60@2x' },
  { size: 180,  scale: 3, idiom: 'iphone', suffix: 'iphone-60@3x' },
  // iPad
  { size: 20,   scale: 1, idiom: 'ipad',   suffix: 'ipad-20@1x' },
  { size: 40,   scale: 2, idiom: 'ipad',   suffix: 'ipad-20@2x' },
  { size: 29,   scale: 1, idiom: 'ipad',   suffix: 'ipad-29@1x' },
  { size: 58,   scale: 2, idiom: 'ipad',   suffix: 'ipad-29@2x' },
  { size: 40,   scale: 1, idiom: 'ipad',   suffix: 'ipad-40@1x' },
  { size: 80,   scale: 2, idiom: 'ipad',   suffix: 'ipad-40@2x' },
  { size: 76,   scale: 1, idiom: 'ipad',   suffix: 'ipad-76@1x' },
  { size: 152,  scale: 2, idiom: 'ipad',   suffix: 'ipad-76@2x' },
  { size: 167,  scale: 2, idiom: 'ipad',   suffix: 'ipad-83.5@2x' },
  // App Store (marketing)
  { size: 1024, scale: 1, idiom: 'ios-marketing', suffix: 'appstore-1024' },
];

// Generate SVG for a given size
function makeSvg(size) {
  const s = size;
  const r = Math.round(s * 0.18); // corner radius
  const cx = s / 2;
  const cy = s / 2;

  // Infinity symbol sizing
  const infW = s * 0.62;
  const infH = s * 0.28;
  const strokeW = Math.max(2, s * 0.07);

  // Percent sign sizing
  const fontSize = Math.round(s * 0.22);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0d2137"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5c842"/>
      <stop offset="100%" stop-color="#e8a020"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${r}" fill="url(#bg)"/>

  <!-- Infinity symbol (∞) centered slightly above middle -->
  <text
    x="${cx}"
    y="${cy + s * 0.08}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Georgia, serif"
    font-size="${Math.round(s * 0.52)}"
    font-weight="bold"
    fill="url(#gold)"
  >∞</text>

  <!-- Percent sign below infinity -->
  <text
    x="${cx}"
    y="${cy + s * 0.35}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="-apple-system, Helvetica Neue, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="#f5c842"
    opacity="0.85"
  >%</text>
</svg>`;
}

async function generateIcon(size, filename) {
  const svg = Buffer.from(makeSvg(size));
  const outPath = path.join(OUTPUT_DIR, filename);
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`  ${filename} (${size}px)`);
}

async function main() {
  console.log('Generating iOS app icons...');

  // Deduplicate by pixel size (same px can appear for different idioms)
  const generated = new Map();

  for (const icon of sizes) {
    const filename = `Icon-${icon.suffix}.png`;
    if (!generated.has(icon.size)) {
      await generateIcon(icon.size, filename);
      generated.set(icon.size, filename);
    } else {
      // Symlink or copy already generated file
      const src = path.join(OUTPUT_DIR, generated.get(icon.size));
      const dst = path.join(OUTPUT_DIR, filename);
      if (!fs.existsSync(dst)) {
        fs.copyFileSync(src, dst);
        console.log(`  ${filename} (${icon.size}px, copy)`);
      }
    }
  }

  // Dark mode variants (same design, slightly lighter)
  await generateIcon(40,   'Icon-dark-iphone-20@2x.png');
  await generateIcon(60,   'Icon-dark-iphone-20@3x.png');
  await generateIcon(120,  'Icon-dark-iphone-60@2x.png');
  await generateIcon(180,  'Icon-dark-iphone-60@3x.png');
  await generateIcon(1024, 'Icon-dark-appstore-1024.png');

  console.log('\nDone. Updating Contents.json...');
  updateContentsJson();
  console.log('Contents.json updated.');
}

function updateContentsJson() {
  const contents = {
    images: [
      // Light mode
      { idiom: 'iphone', platform: 'ios', scale: '2x', size: '20x20',   filename: 'Icon-iphone-20@2x.png' },
      { idiom: 'iphone', platform: 'ios', scale: '3x', size: '20x20',   filename: 'Icon-iphone-20@3x.png' },
      { idiom: 'iphone', platform: 'ios', scale: '2x', size: '29x29',   filename: 'Icon-iphone-29@2x.png' },
      { idiom: 'iphone', platform: 'ios', scale: '3x', size: '29x29',   filename: 'Icon-iphone-29@3x.png' },
      { idiom: 'iphone', platform: 'ios', scale: '2x', size: '40x40',   filename: 'Icon-iphone-40@2x.png' },
      { idiom: 'iphone', platform: 'ios', scale: '3x', size: '40x40',   filename: 'Icon-iphone-40@3x.png' },
      { idiom: 'iphone', platform: 'ios', scale: '2x', size: '60x60',   filename: 'Icon-iphone-60@2x.png' },
      { idiom: 'iphone', platform: 'ios', scale: '3x', size: '60x60',   filename: 'Icon-iphone-60@3x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '1x', size: '20x20',   filename: 'Icon-ipad-20@1x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '2x', size: '20x20',   filename: 'Icon-ipad-20@2x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '1x', size: '29x29',   filename: 'Icon-ipad-29@1x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '2x', size: '29x29',   filename: 'Icon-ipad-29@2x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '1x', size: '40x40',   filename: 'Icon-ipad-40@1x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '2x', size: '40x40',   filename: 'Icon-ipad-40@2x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '1x', size: '76x76',   filename: 'Icon-ipad-76@1x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '2x', size: '76x76',   filename: 'Icon-ipad-76@2x.png' },
      { idiom: 'ipad',   platform: 'ios', scale: '2x', size: '83.5x83.5', filename: 'Icon-ipad-83.5@2x.png' },
      { idiom: 'ios-marketing', platform: 'ios', scale: '1x', size: '1024x1024', filename: 'Icon-appstore-1024.png' },
      // Dark mode variants
      {
        appearances: [{ appearance: 'luminosity', value: 'dark' }],
        idiom: 'iphone', platform: 'ios', scale: '2x', size: '20x20',
        filename: 'Icon-dark-iphone-20@2x.png'
      },
      {
        appearances: [{ appearance: 'luminosity', value: 'dark' }],
        idiom: 'iphone', platform: 'ios', scale: '3x', size: '20x20',
        filename: 'Icon-dark-iphone-20@3x.png'
      },
      {
        appearances: [{ appearance: 'luminosity', value: 'dark' }],
        idiom: 'iphone', platform: 'ios', scale: '2x', size: '60x60',
        filename: 'Icon-dark-iphone-60@2x.png'
      },
      {
        appearances: [{ appearance: 'luminosity', value: 'dark' }],
        idiom: 'iphone', platform: 'ios', scale: '3x', size: '60x60',
        filename: 'Icon-dark-iphone-60@3x.png'
      },
      {
        appearances: [{ appearance: 'luminosity', value: 'dark' }],
        idiom: 'ios-marketing', platform: 'ios', scale: '1x', size: '1024x1024',
        filename: 'Icon-dark-appstore-1024.png'
      },
    ],
    info: { author: 'xcode', version: 1 }
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'Contents.json'),
    JSON.stringify(contents, null, 2)
  );
}

main().catch(err => { console.error(err); process.exit(1); });
