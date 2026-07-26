const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPngBuffer(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([139, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT (raw uncompressed scanlines)
  const lineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * lineLength);

  for (let y = 0; y < height; y++) {
    const offset = y * lineLength;
    rawData[offset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(12 + length);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4);
  data.copy(buffer, 8);

  const crc = crc32(buffer.slice(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write icons
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPngBuffer(1024, 1024, 15, 23, 42));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createPngBuffer(1024, 1024, 16, 185, 129));
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createPngBuffer(1024, 1024, 15, 23, 42));
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), createPngBuffer(48, 48, 16, 185, 129));

console.log('Successfully created png assets!');
