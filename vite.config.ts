import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { Buffer } from 'buffer';

// --- Native PNG Generator (No external dependencies) ---

// Precompute CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

// Calculate CRC32
function crc32(buf: Buffer): Buffer {
  let crc = -1; // 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = (crc ^ -1) >>> 0;
  const res = Buffer.alloc(4);
  res.writeUInt32BE(crc, 0);
  return res;
}

// Create a PNG Chunk
function createChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = crc32(crcInput);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Generate a valid RGB PNG Buffer
function generatePng(width: number, height: number): Buffer {
  // 1. IHDR (Image Header)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 2; // Color type: 2 (Truecolor RGB)
  ihdrData[10] = 0; // Compression: 0 (Deflate)
  ihdrData[11] = 0; // Filter: 0 (None)
  ihdrData[12] = 0; // Interlace: 0 (None)
  const ihdr = createChunk('IHDR', ihdrData);

  // 2. IDAT (Image Data)
  // Format: [Filter (1 byte)] [R] [G] [B] ... for each scanline
  const rowSize = width * 3 + 1;
  const rawData = Buffer.alloc(height * rowSize);
  
  // Colors for "MindGrid" Icon
  const bg = [30, 41, 59];   // Slate 800 (#1e293b)
  const fg = [59, 130, 246]; // Blue 500 (#3b82f6)

  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0; // Filter type 0 (None)
    
    for (let x = 0; x < width; x++) {
      const pixelOffset = offset + 1 + x * 3;
      
      // Pattern: Centered Square (MindGrid Logic Box)
      const padding = Math.floor(width * 0.25);
      const isFg = x >= padding && x < width - padding && y >= padding && y < height - padding;
      
      const color = isFg ? fg : bg;
      
      rawData[pixelOffset] = color[0];
      rawData[pixelOffset + 1] = color[1];
      rawData[pixelOffset + 2] = color[2];
    }
  }

  // Compress data using Zlib
  const compressedData = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressedData);

  // 3. IEND (Image End)
  const iend = createChunk('IEND', Buffer.alloc(0));

  // 4. PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// --- Vite Plugin ---

const writeIconsPlugin = () => ({
  name: 'write-icons',
  configResolved() {
     const iconsDir = path.resolve('public/icons');
     if (!fs.existsSync(iconsDir)) {
       fs.mkdirSync(iconsDir, { recursive: true });
     }
     
     const sizes = [192, 512];
     
     console.log('[MindGrid] Generating App Icons...');
     sizes.forEach(size => {
       const file = path.join(iconsDir, `icon-${size}.png`);
       try {
         const buffer = generatePng(size, size);
         fs.writeFileSync(file, buffer);
         console.log(`  ✓ Generated public/icons/icon-${size}.png (${(buffer.length / 1024).toFixed(2)} KB)`);
       } catch (e) {
         console.error(`  ✗ Error generating icon-${size}.png:`, e);
       }
     });
  }
});

export default defineConfig({
  plugins: [react(), writeIconsPlugin()],
  publicDir: 'public', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    host: true
  }
});