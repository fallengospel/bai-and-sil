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
  return (px, py) => {
    if (px < x || px > x + w || py < y || py > y + h) return false;
    const corners = [[x+r,y+r],[x+w-r,y+r],[x+r,y+h-r],[x+w-r,y+h-r]];
    for (const [cx, cy] of corners) {
      const dx = px - cx, dy = py - cy;
      if ((dx < 0 && px < x+r) || (dx > 0 && px > x+w-r) ||
          (dy < 0 && py < y+r) || (dy > 0 && py > y+h-r)) {
        if (dx*dx + dy*dy > r*r) return false;
      }
    }
    return true;
  };
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2-x1, dy = y2-y1;
  const lenSq = dx*dx + dy*dy;
  if (lenSq === 0) return Math.hypot(px-x1, py-y1);
  let t = Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / lenSq));
  return Math.hypot(px-(x1+t*dx), py-(y1+t*dy));
}

function generateMark(mW, mH, bagFill, handleStroke, pesoStroke) {
  const pixels = new Uint8Array(mW * mH * 4);
  const sx = mW / 64, sy = mH / 64;
  const bag = roundedRect(6*sx, 23*sy, 52*sx, 35*sy, 11*sx);

  for (let y = 0; y < mH; y++) {
    for (let x = 0; x < mW; x++) {
      const idx = (y * mW + x) * 4;
      const px = x / sx, py = y / sy;

      if (bag(x/sx, y/sy)) {
        pixels[idx] = bagFill[0]; pixels[idx+1] = bagFill[1]; pixels[idx+2] = bagFill[2]; pixels[idx+3] = 255;
        continue;
      }

      // Handle, arrow, peso strokes
      const hw = 5.2, pw = 3.6;
      if (distToSegment(px,py, 20,27, 20,21) <= hw ||
          distToSegment(px,py, 20,21, 42.5,15.2) <= hw ||
          distToSegment(px,py, 36.5,12.5, 43.8,14.4) <= hw ||
          distToSegment(px,py, 43.8,14.4, 42,21.7) <= hw) {
        pixels[idx] = handleStroke[0]; pixels[idx+1] = handleStroke[1]; pixels[idx+2] = handleStroke[2]; pixels[idx+3] = 255;
        continue;
      }

      if (distToSegment(px,py, 32,33.5, 32,51.5) <= pw ||
          distToSegment(px,py, 25.5,39.5, 38.5,39.5) <= pw ||
          distToSegment(px,py, 25.5,45, 38.5,45) <= pw ||
          distToSegment(px,py, 32,33.5, 37.2,33.5) <= pw ||
          distToSegment(px,py, 37.2,33.5, 37.2,44.7) <= pw) {
        pixels[idx] = pesoStroke[0]; pixels[idx+1] = pesoStroke[1]; pixels[idx+2] = pesoStroke[2]; pixels[idx+3] = 255;
      }
    }
  }
  return pixels;
}

// Simple pixel text renderer for "BAI&SIL" and tagline
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

  // Draw mark (white bag, gold handle, white peso) - centered
  const markSize = 200;
  const markX = Math.round((WIDTH - markSize) / 2);
  const markY = 100;
  const markPixels = generateMark(markSize, markSize, [255,255,255], [245,189,93], [255,255,255]);

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

  // Draw "BAI&SIL" text below mark (large, white, with gold &)
  // Using simple pixel rectangles for each letter segment
  const letters = {
    'B': [[0,0,3,20],[3,0,8,3],[3,9,8,3],[3,18,8,3],[11,3,3,6],[11,12,3,6]],
    'A': [[0,18,3,2],[4,0,3,2],[8,18,3,2],[0,10,3,2],[8,10,3,2],[0,3,12,3],[0,0,3,3],[9,0,3,3]],
    'I': [[0,0,6,3],[2,3,2,15],[0,18,6,2]],
    '&': [[6,0,4,3],[3,3,3,3],[0,6,3,6],[3,12,3,3],[6,15,4,3],[9,12,3,3]],
    'S': [[3,0,8,3],[0,3,3,6],[3,9,8,3],[9,12,3,6],[0,18,8,3]],
  };

  const charW = 40, charH = 24, gap = 8;
  const text = 'BAI&SIL';
  const totalW = text.length * (charW + gap) - gap;
  const textX = Math.round((WIDTH - totalW) / 2);
  const textY = 340;

  const white = [255, 255, 255];
  const gold = [245, 189, 93];

  let curX = textX;
  for (const ch of text) {
    const color = ch === '&' ? gold : white;
    const segs = letters[ch] || [];
    for (const [sx, sy, sw, sh] of segs) {
      for (let dy = 0; dy < sh; dy++) {
        for (let dx = 0; dx < sw; dx++) {
          const px = curX + sx + dx, py = textY + sy + dy;
          if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
            const idx = (py * WIDTH + px) * 4;
            pixels[idx] = color[0]; pixels[idx+1] = color[1]; pixels[idx+2] = color[2]; pixels[idx+3] = 255;
          }
        }
      }
    }
    curX += charW + gap;
  }

  // Draw tagline "Find stuff. Sell stuff. Repeat." as a solid bar
  const tagY = textY + 50;
  const tagW = 360, tagH = 4;
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
