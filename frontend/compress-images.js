// compress-images.js - Working version
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'public/images');
const images = [
  { name: 'admissions-bg.jpg', quality: 65, maxWidth: 1600 },
  { name: 'about-bg.jpg', quality: 70, maxWidth: 1600 },
  { name: 'programs-bg.jpg', quality: 70, maxWidth: 1600 },
  { name: 'kalveo-bg.jpg', quality: 80, maxWidth: 1200 },
  { name: 'alveoly-logo.png', quality: 85, maxWidth: 500 },
  { name: 'alveoly-log.png', quality: 85, maxWidth: 500 },
  { name: 'university-logo.png', quality: 85, maxWidth: 300 }
];

async function compressImages() {
  console.log('🔨 Starting image compression...\n');
  
  for (const img of images) {
    const inputPath = path.join(imagesDir, img.name);
    
    if (fs.existsSync(inputPath)) {
      const stats = fs.statSync(inputPath);
      const originalSize = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`📷 Compressing ${img.name} (${originalSize}MB)...`);
      
      try {
        let pipeline = sharp(inputPath);
        
        // Resize if width exceeds maxWidth
        const metadata = await pipeline.metadata();
        if (metadata.width > img.maxWidth) {
          pipeline = pipeline.resize(img.maxWidth, null, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }
        
        // Compress based on file type
        if (img.name.endsWith('.jpg') || img.name.endsWith('.jpeg')) {
          pipeline = pipeline.jpeg({ quality: img.quality, progressive: true });
        } else if (img.name.endsWith('.png')) {
          pipeline = pipeline.png({ quality: img.quality, compressionLevel: 9 });
        }
        
        // Save compressed version
        const tempPath = path.join(imagesDir, `temp-${img.name}`);
        await pipeline.toFile(tempPath);
        
        // Replace original with compressed
        fs.renameSync(tempPath, inputPath);
        
        const newStats = fs.statSync(inputPath);
        const newSize = (newStats.size / (1024 * 1024)).toFixed(2);
        const saved = ((stats.size - newStats.size) / (1024 * 1024)).toFixed(2);
        
        console.log(`✅ Compressed: ${originalSize}MB → ${newSize}MB (Saved ${saved}MB)\n`);
      } catch (err) {
        console.error(`❌ Error compressing ${img.name}:`, err.message);
      }
    } else {
      console.log(`⚠️ ${img.name} not found, skipping...\n`);
    }
  }
  
  console.log('🎉 All images compressed successfully!');
}

compressImages().catch(console.error);