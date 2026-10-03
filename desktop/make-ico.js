// desktop/make-ico.js
const sharp = require("sharp");
const { sharpsToIco } = require("sharp-ico");

(async () => {
  const input = "build/icon.png";
  const output = "build/icon.ico";

  // Load PNG into a sharp instance
  const sharpInstance = sharp(input);

  // sharpsToIco(imageList, fileOut, options) — writes the .ico to disk itself
  const result = await sharpsToIco([sharpInstance], output, {
    sizes: [16, 24, 32, 48, 64, 128, 256],
  });

  console.log(`Wrote ${output}:`, result);
})().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});