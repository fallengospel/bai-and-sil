// Generate OG image (1200x630) with stacked reverse lockup on #062250 background
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const WIDTH = 1200;
const HEIGHT = 630;
const BG_COLOR = [6, 34, 80]; // #062250

function createPNG(width, height, pixelData) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = createChunk('IHDR', ihdrData);
  const rawRow = width * 4;
  const rawData = Buffer.alloc((rawRow + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (rawRow + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (rawRow + 1) + 1 + x * 4;
      rawData[dstIdx] = pixelData[srcIdx];
      rawData[dstIdx + 1] = pixelData[srcIdx + 1];
      rawData[dstIdx + 2] = pixelData[srcIdx + 2];
      rawData[dstIdx + 3] = pixelData[srcIdx + 3];
    }
  }
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function roundedRect(x, y, w, h, r) {
  // SDF-style test: inside the rect, and within radius of the nearest corner
  // only when beyond the inner (inset-by-r) box on BOTH axes.
  return (px, py) => {
    if (px < x || px > x + w || py < y || py > y + h) return false;
    const dx = Math.max(x + r - px, px - (x + w - r), 0);
    const dy = Math.max(y + r - py, py - (y + h - r), 0);
    return dx * dx + dy * dy <= r * r;
  };
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2-x1, dy = y2-y1;
  const lenSq = dx*dx + dy*dy;
  if (lenSq === 0) return Math.hypot(px-x1, py-y1);
  let t = Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / lenSq));
  return Math.hypot(px-(x1+t*dx), py-(y1+t*dy));
}

function generateMark(mW, mH, tileFill, goldStroke, barStroke) {
  const pixels = new Uint8Array(mW * mH * 4);
  const sx = mW / 64, sy = mH / 64;
  // SALPAK mark in 64x64 viewBox units (matches Logo.tsx)
  const tile = roundedRect(4, 4, 56, 56, 14);

  for (let y = 0; y < mH; y++) {
    for (let x = 0; x < mW; x++) {
      const idx = (y * mW + x) * 4;
      const px = x / sx, py = y / sy;

      // Gold: arrow shaft, arrowhead, impact sparks
      if (distToSegment(px, py, 32, 12, 32, 38) <= 2.7 ||
          distToSegment(px, py, 23, 29, 32, 38) <= 2.7 ||
          distToSegment(px, py, 41, 29, 32, 38) <= 2.7 ||
          distToSegment(px, py, 14, 36, 8.5, 30.5) <= 2 ||
          distToSegment(px, py, 50, 36, 55.5, 30.5) <= 2) {
        pixels[idx] = goldStroke[0]; pixels[idx+1] = goldStroke[1]; pixels[idx+2] = goldStroke[2]; pixels[idx+3] = 255;
        continue;
      }

      // White: impact bar
      if (distToSegment(px, py, 16, 46, 48, 46) <= 2.5) {
        pixels[idx] = barStroke[0]; pixels[idx+1] = barStroke[1]; pixels[idx+2] = barStroke[2]; pixels[idx+3] = 255;
        continue;
      }

      // Navy tile (behind the glyph)
      if (tile(px, py)) {
        pixels[idx] = tileFill[0]; pixels[idx+1] = tileFill[1]; pixels[idx+2] = tileFill[2]; pixels[idx+3] = 255;
      }
    }
  }
  return pixels;
}

// Simple pixel text renderer for "SALPAK" and tagline
function drawText(pixels, w, h, text, cx, cy, charW, charH, color) {
  const startX = cx - (text.length * charW) / 2;
  for (let i = 0; i < text.length; i++) {
    const x0 = Math.round(startX + i * charW);
    const y0 = cy;
    for (let dy = 0; dy < charH; dy++) {
      for (let dx = 0; dx < charW - 2; dx++) {
        const px = x0 + dx, py = y0 + dy;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const idx = (py * w + px) * 4;
          // Simple anti-aliasing on edges
          const edge = dx === 0 || dx === charW-3 || dy === 0 || dy === charH-1;
          const a = edge ? 0.7 : 1.0;
          pixels[idx] = Math.round(color[0] * a);
          pixels[idx+1] = Math.round(color[1] * a);
          pixels[idx+2] = Math.round(color[2] * a);
          pixels[idx+3] = 255;
        }
      }
    }
  }
}

function generate() {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 4);

  // Fill background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = BG_COLOR[0]; pixels[i+1] = BG_COLOR[1]; pixels[i+2] = BG_COLOR[2]; pixels[i+3] = 255;
  }

  // Draw mark (navy tile, gold arrow, white bar) - centered
  const markSize = 200;
  const markX = Math.round((WIDTH - markSize) / 2);
  const markY = 100;
  const markPixels = generateMark(markSize, markSize, [10,46,110], [245,189,93], [255,255,255]);

  for (let y = 0; y < markSize; y++) {
    for (let x = 0; x < markSize; x++) {
      const srcIdx = (y * markSize + x) * 4;
      if (markPixels[srcIdx+3] > 0) {
        const dx = x + markX, dy = y + markY;
        if (dx >= 0 && dx < WIDTH && dy >= 0 && dy < HEIGHT) {
          const dstIdx = (dy * WIDTH + dx) * 4;
          pixels[dstIdx] = markPixels[srcIdx];
          pixels[dstIdx+1] = markPixels[srcIdx+1];
          pixels[dstIdx+2] = markPixels[srcIdx+2];
          pixels[dstIdx+3] = 255;
        }
      }
    }
  }

  // Draw "SALPAK" text below mark (large; SAL white, PAK gold)
  // Using simple pixel rectangles for each letter segment
  const letters = {
    'S': [[3,0,8,3],[0,3,3,6],[3,9,8,3],[9,12,3,6],[0,18,8,3]],
    'A': [[0,0,12,3],[0,0,3,21],[9,0,3,21],[0,9,12,3]],
    'L': [[0,0,3,21],[0,18,9,3]],
    'P': [[0,0,3,21],[3,0,8,3],[9,3,3,6],[3,9,8,3]],
    'K': [[0,0,3,21],[9,0,3,4],[6,4,3,4],[3,8,3,4],[6,13,3,4],[9,17,3,4]],
  };

  const SCALE = 3;
  const charW = 12 * SCALE, gap = 20;
  const text = 'SALPAK';
  const totalW = text.length * (charW + gap) - gap;
  const textX = Math.round((WIDTH - totalW) / 2);
  const textY = 330;

  const white = [255, 255, 255];
  const gold = [245, 189, 93];

  let curX = textX;
  for (let ti = 0; ti < text.length; ti++) {
    const ch = text[ti];
    const color = ti >= 3 ? gold : white; // SAL white, PAK gold
    const segs = letters[ch] || [];
    for (const [sx, sy, sw, sh] of segs) {
      for (let dy = 0; dy < sh * SCALE; dy++) {
        for (let dx = 0; dx < sw * SCALE; dx++) {
          const px = curX + sx * SCALE + dx, py = textY + sy * SCALE + dy;
          if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
            const idx = (py * WIDTH + px) * 4;
            pixels[idx] = color[0]; pixels[idx+1] = color[1]; pixels[idx+2] = color[2]; pixels[idx+3] = 255;
          }
        }
      }
    }
    curX += charW + gap;
  }

  // Draw tagline bar (gold) below the wordmark
  const tagY = textY + 21 * SCALE + 20;
  const tagW = 480, tagH = 5;
  const tagX = Math.round((WIDTH - tagW) / 2);
  for (let dy = 0; dy < tagH; dy++) {
    for (let dx = 0; dx < tagW; dx++) {
      const px = tagX + dx, py = tagY + dy;
      if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
        const idx = (py * WIDTH + px) * 4;
        pixels[idx] = 245; pixels[idx+1] = 189; pixels[idx+2] = 93; pixels[idx+3] = 255;
      }
    }
  }

  const outDir = path.join(__dirname, '..', 'public');
  const png = createPNG(WIDTH, HEIGHT, pixels);
  fs.writeFileSync(path.join(outDir, 'og-image.png'), png);
  console.log(`Generated og-image.png (${png.length} bytes)`);
}

generate();
