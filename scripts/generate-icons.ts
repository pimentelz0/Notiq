import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Minimalist black pencil with an artistic scribble ("rabisco") on solid offwhite background (#F9F9F8)
// No nested cards, no inner boxes or borders.
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Solid full-bleed offwhite background -->
  <rect width="512" height="512" fill="#F9F9F8"/>

  <!-- Pencil & Scribble composition centered within safe-zone -->
  <g fill="none" stroke="#1C1917" stroke-linecap="round" stroke-linejoin="round">
    
    <!-- Fluid organic scribble / rabisco stroke trailing from the pencil tip -->
    <path d="M 204 296 
             C 185 315, 148 335, 140 360 
             C 132 385, 168 396, 195 380 
             C 228 360, 205 328, 240 338 
             C 272 346, 290 382, 325 380 
             C 352 378, 375 358, 395 362" 
          stroke-width="16" />

    <!-- Minimalist Pencil Group (angled at 45 degrees) -->
    <g transform="translate(262, 218) rotate(42)">
      <!-- Pencil Body / Barrel -->
      <!-- Left & Right outer edges -->
      <path d="M -18,-115 L -18,48 L 0,86 L 18,48 L 18,-115 Z" 
            stroke-width="15" 
            fill="#F9F9F8" />
      
      <!-- Central facet spine -->
      <line x1="0" y1="-115" x2="0" y2="48" stroke-width="11" />

      <!-- Sharpened wood collar arc / scallop -->
      <path d="M -18,48 Q 0,40 18,48" stroke-width="11" />

      <!-- Solid graphite lead tip -->
      <polygon points="-8,70 0,86 8,70" fill="#1C1917" stroke="#1C1917" stroke-width="6" />

      <!-- Ferrule (metal band) -->
      <line x1="-18" y1="-115" x2="18" y2="-115" stroke-width="12" />
      <line x1="-18" y1="-128" x2="18" y2="-128" stroke-width="10" />

      <!-- Eraser tip (rounded minimalist arch) -->
      <path d="M -18,-128 C -18,-148 18,-148 18,-128" 
            stroke-width="14" 
            fill="#1C1917" />
    </g>

    <!-- Tiny decorative sketch accent / graphite flick -->
    <path d="M 235 272 C 242 265, 248 262, 256 260" stroke-width="9" opacity="0.6" />
  </g>
</svg>`;

async function generate() {
  const publicDir = path.resolve(process.cwd(), 'public');
  
  // 1. Write public/icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('Saved public/icon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png (180x180)');

  // 3. Generate pwa-192x192.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png (192x192)');

  // 4. Generate pwa-512x512.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png (512x512)');

  // 5. Generate pwa-maskable-512x512.png (512x512) with full-bleed offwhite
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png (512x512)');

  // 6. Generate favicon-32x32.png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('Generated favicon-32x32.png (32x32)');

  // Also write manifest.json so both /manifest.webmanifest and /manifest.json exist
  const manifestWebmanifest = fs.readFileSync(path.join(publicDir, 'manifest.webmanifest'), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'manifest.json'), manifestWebmanifest, 'utf-8');
  console.log('Synced manifest.json');
}

generate().catch(console.error);
