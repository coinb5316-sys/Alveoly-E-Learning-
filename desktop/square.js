// desktop/square.js — pad any PNG into a square canvas
const sharp = require("sharp");
const path = require("path");

const input = process.argv[2] || "build/icon.png";
const output = process.argv[3] || "build/icon-squared.png";
const size = parseInt(process.argv[4] || "512", 10);

(async () => {
  try {
    const meta = await sharp(input).metadata();
    console.log(`Input: ${input} (${meta.width}x${meta.height})`);

    // Compute how much padding is needed on each side
    const padX = Math.max(0, Math.floor((size - meta.width) / 2));
    const padY = Math.max(0, Math.floor((size - meta.height) / 2));

    await sharp(input)
      .resize({
        width: Math.min(meta.width, size),
        height: Math.min(meta.height, size),
        fit: "inside",
        withoutEnlargement: false,
      })
      .extend({
        top: padY,
        bottom: padY,
        left: padX,
        right: padX,
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent
      })
      .png()
      .toFile(output);

    console.log(`Output: ${output} (${size}x${size})`);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();