// Converts tagStandard52h13.c (48714 uint64 tag codes) into a compact RGB PNG.
// See README for browser decoding.

const fs = require("fs");
const { PNG } = require("pngjs");

const src = fs.readFileSync("vendor/tagStandard52h13.c.txt", "utf8");
const matches = src.match(/0x[0-9a-fA-F]+UL/g);
const n = matches.length;

// Pack all entries as flat byte stream
const bytes = Buffer.allocUnsafe(n * 8);
matches.forEach((v, i) => {
  const val = BigInt(v.replace("UL", ""));
  for (let b = 0; b < 8; b++) {
    bytes[i * 8 + b] = Number((val >> BigInt(56 - b * 8)) & 0xffn);
  }
});

// n=48714, 48714*8=389712 bytes, /3=129904 RGB pixels, 368×353=129904 (exact)
const width = 368;
const height = 353;

const png = new PNG({ width, height, colorType: 2 }); // RGB

for (let i = 0; i < width * height; i++) {
  png.data[i * 4 + 0] = bytes[i * 3 + 0]; // R
  png.data[i * 4 + 1] = bytes[i * 3 + 1]; // G
  png.data[i * 4 + 2] = bytes[i * 3 + 2]; // B
  png.data[i * 4 + 3] = 255;
}

fs.writeFileSync("output/tagStandard52h13.png", PNG.sync.write(png));
console.log(`${n} entries → ${width}×${height} RGB PNG`);
