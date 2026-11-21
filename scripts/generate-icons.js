// Generate PNG icons using pure Node.js (no external deps)
// Creates a 512x512 PNG with the mark centered on a #062250 rounded background

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 512;
const CORNER_RADIUS = 96;
const BG_COLOR = [6, 34, 80]; // #062250

// Mark paths (simplified rasterization on a 64x64 grid, scaled to fit 62% of canvas)
const MARK_SIZE = Math.round(SIZE * 0.62); // ~317
const MARK_OFFSET = Math.round((SIZE - MARK_SIZE) / 2); // ~97

function createPNG(width, height, pixelData) {
  // PNG file signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk - raw pixel data with zlib
  const rawRow = width * 4;
  const rawData = Buffer.alloc((rawRow + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (rawRow + 1)] = 0; // filter none
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

  // IEND chunk
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

function generateMarkPixels(markW, markH) {
  const pixels = new Uint8Array(markW * markH * 4);

  // Colors
  const navy = [10, 46, 110, 255];     // #0A2E6E
  const gold = [245, 189, 93, 255];    // #F5BD5D
  const white = [255, 255, 255, 255];

  // All geometry in 64x64 viewBox units (matches Logo.tsx)
  const sx = markW / 64;
  const sy = markH / 64;
  const tile = roundedRect(4, 4, 56, 56, 14);

  function stroke(px, py, x1, y1, x2, y2, halfWidth) {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)) <= halfWidth;
  }

  for (let y = 0; y < markH; y++) {
    for (let x = 0; x < markW; x++) {
      const idx = (y * markW + x) * 4;
      const px = x / sx;
      const py = y / sy;

      // Gold: arrow shaft, arrowhead, impact sparks
      if (stroke(px, py, 32, 12, 32, 38, 2.7) ||
          stroke(px, py, 23, 29, 32, 38, 2.7) ||
          stroke(px, py, 41, 29, 32, 38, 2.7) ||
          stroke(px, py, 14, 36, 8.5, 30.5, 2) ||
          stroke(px, py, 50, 36, 55.5, 30.5, 2)) {
        pixels[idx] = gold[0];
        pixels[idx + 1] = gold[1];
        pixels[idx + 2] = gold[2];
        pixels[idx + 3] = 255;
        continue;
      }

      // White: impact bar
      if (stroke(px, py, 16, 46, 48, 46, 2.5)) {
        pixels[idx] = white[0];
        pixels[idx + 1] = white[1];
        pixels[idx + 2] = white[2];
        pixels[idx + 3] = 255;
        continue;
      }

      // Navy tile (behind the glyph)
      if (tile(px, py)) {
        pixels[idx] = navy[0];
        pixels[idx + 1] = navy[1];
        pixels[idx + 2] = navy[2];
        pixels[idx + 3] = 255;
      }
    }
  }

  return pixels;
}

function generateIcon() {
  const pixels = new Uint8Array(SIZE * SIZE * 4);

  // Fill background with rounded rect
  const bgTest = roundedRect(0, 0, SIZE, SIZE, CORNER_RADIUS);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      if (bgTest(x, y)) {
        pixels[idx] = BG_COLOR[0];
        pixels[idx + 1] = BG_COLOR[1];
        pixels[idx + 2] = BG_COLOR[2];
        pixels[idx + 3] = 255;
      } else {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      }
    }
  }

  // Overlay the mark
  const markPixels = generateMarkPixels(MARK_SIZE, MARK_SIZE);
  for (let y = 0; y < MARK_SIZE; y++) {
    for (let x = 0; x < MARK_SIZE; x++) {
      const srcIdx = (y * MARK_SIZE + x) * 4;
      if (markPixels[srcIdx + 3] > 0) {
        const dx = x + MARK_OFFSET;
        const dy = y + MARK_OFFSET;
        if (dx >= 0 && dx < SIZE && dy >= 0 && dy < SIZE) {
          const dstIdx = (dy * SIZE + dx) * 4;
          // Alpha blend
          const a = markPixels[srcIdx + 3] / 255;
          pixels[dstIdx] = Math.round(markPixels[srcIdx] * a + pixels[dstIdx] * (1 - a));
          pixels[dstIdx + 1] = Math.round(markPixels[srcIdx + 1] * a + pixels[dstIdx + 1] * (1 - a));
          pixels[dstIdx + 2] = Math.round(markPixels[srcIdx + 2] * a + pixels[dstIdx + 2] * (1 - a));
          pixels[dstIdx + 3] = 255;
        }
      }
    }
  }

  return pixels;
}

const outDir = path.join(__dirname, '..', 'public');
const pixels = generateIcon();
const png = createPNG(SIZE, SIZE, pixels);

fs.writeFileSync(path.join(outDir, 'icon-512.png'), png);
fs.writeFileSync(path.join(outDir, 'apple-icon.png'), png);
console.log(`Generated icon-512.png (${png.length} bytes) and apple-icon.png`);
