import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

// Valid 1x1 Pixel PNG (Blue #3b82f6) to ensure MIME type detection works
const BASE64_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADAgH/ZnQTvwAAAABJRU5ErkJggg==';

const writeIconsPlugin = () => ({
  name: 'write-icons',
  configResolved() {
     // Ensure icons exist before build/serve
     const iconsDir = path.resolve('public/icons');
     if (!fs.existsSync(iconsDir)) {
       fs.mkdirSync(iconsDir, { recursive: true });
     }
     
     const iconSizes = ['192', '512'];
     const buffer = Buffer.from(BASE64_PNG, 'base64');
     
     iconSizes.forEach(size => {
       const file = path.join(iconsDir, `icon-${size}.png`);
       // Force write to ensure binary content replaces any placeholders
       fs.writeFileSync(file, buffer);
       console.log(`Generated valid PNG for icon-${size}.png`);
     });
  }
});

export default defineConfig({
  plugins: [react(), writeIconsPlugin()],
  publicDir: 'public', // Explicitly define public directory
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    host: true
  }
});