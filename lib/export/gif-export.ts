// GIF Export and Thumbnail Generation utilities

export interface GifExportOptions {
  width: number;
  height: number;
  fps: number;
  quality: number; // 1-20, lower is better
  loop: boolean;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0-1
}

// Default export options
export const DEFAULT_GIF_OPTIONS: GifExportOptions = {
  width: 480,
  height: 270,
  fps: 10,
  quality: 10,
  loop: true,
};

export const DEFAULT_THUMBNAIL_OPTIONS: ThumbnailOptions = {
  width: 320,
  height: 180,
  format: 'png',
  quality: 0.9,
};

// Capture a frame from a canvas or element
export async function captureFrame(
  element: HTMLElement,
  options: ThumbnailOptions = DEFAULT_THUMBNAIL_OPTIONS
): Promise<string> {
  // Use html2canvas if available, otherwise use native methods
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      width: options.width,
      height: options.height,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    });

    return canvas.toDataURL(`image/${options.format}`, options.quality);
  } catch (error) {
    console.warn('html2canvas not available, using fallback');
    // Fallback: create a simple colored placeholder
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, options.width, options.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scene Thumbnail', options.width / 2, options.height / 2);
    }
    return canvas.toDataURL(`image/${options.format}`, options.quality);
  }
}

// Generate thumbnail for a scene
export async function generateSceneThumbnail(
  sceneElement: HTMLElement | null,
  options: Partial<ThumbnailOptions> = {}
): Promise<string> {
  const opts = { ...DEFAULT_THUMBNAIL_OPTIONS, ...options };

  if (!sceneElement) {
    // Return placeholder
    const canvas = document.createElement('canvas');
    canvas.width = opts.width;
    canvas.height = opts.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, opts.width, opts.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, opts.width, opts.height);
    }
    return canvas.toDataURL(`image/${opts.format}`, opts.quality);
  }

  return captureFrame(sceneElement, opts);
}

// GIF creation using a custom LZW-based GIF encoder
export interface GifFrame {
  imageData: ImageData | HTMLCanvasElement | HTMLImageElement;
  delay: number; // ms
}

// Simple color quantization - reduces colors to fit GIF palette
function quantizeColors(imageData: Uint8ClampedArray, maxColors: number = 256): { palette: number[][], indexed: Uint8Array } {
  const colorCounts = new Map<string, { color: number[], count: number }>();
  
  // Count color occurrences
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i] & 0xF8;     // Reduce to 5 bits
    const g = imageData[i + 1] & 0xF8;
    const b = imageData[i + 2] & 0xF8;
    const key = `${r},${g},${b}`;
    
    const existing = colorCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorCounts.set(key, { color: [r, g, b], count: 1 });
    }
  }
  
  // Sort by count and take top colors
  const sortedColors = Array.from(colorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors);
  
  const palette = sortedColors.map(c => c.color);
  
  // Ensure we have at least 2 colors
  while (palette.length < 2) {
    palette.push([0, 0, 0]);
  }
  
  // Pad to power of 2
  const targetSize = Math.pow(2, Math.ceil(Math.log2(palette.length)));
  while (palette.length < targetSize) {
    palette.push([0, 0, 0]);
  }
  
  // Map pixels to palette indices
  const indexed = new Uint8Array(imageData.length / 4);
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    
    // Find closest color
    let minDist = Infinity;
    let closestIndex = 0;
    for (let j = 0; j < palette.length; j++) {
      const pr = palette[j][0];
      const pg = palette[j][1];
      const pb = palette[j][2];
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (dist < minDist) {
        minDist = dist;
        closestIndex = j;
      }
    }
    indexed[i / 4] = closestIndex;
  }
  
  return { palette, indexed };
}

// LZW encoder for GIF
function lzwEncode(indexed: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  
  const output: number[] = [];
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const codeTable = new Map<string, number>();
  
  // Initialize code table
  for (let i = 0; i < clearCode; i++) {
    codeTable.set(String(i), i);
  }
  
  let buffer = 0;
  let bufferSize = 0;
  
  const writeCode = (code: number) => {
    buffer |= code << bufferSize;
    bufferSize += codeSize;
    while (bufferSize >= 8) {
      output.push(buffer & 0xFF);
      buffer >>= 8;
      bufferSize -= 8;
    }
  };
  
  writeCode(clearCode);
  
  let indexBuffer = String(indexed[0]);
  
  for (let i = 1; i < indexed.length; i++) {
    const k = String(indexed[i]);
    const combined = indexBuffer + ',' + k;
    
    if (codeTable.has(combined)) {
      indexBuffer = combined;
    } else {
      writeCode(codeTable.get(indexBuffer)!);
      
      if (nextCode < 4096) {
        codeTable.set(combined, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      }
      
      indexBuffer = k;
    }
  }
  
  writeCode(codeTable.get(indexBuffer)!);
  writeCode(eoiCode);
  
  // Flush remaining bits
  if (bufferSize > 0) {
    output.push(buffer & 0xFF);
  }
  
  return new Uint8Array(output);
}

export class GifEncoder {
  private frames: GifFrame[] = [];
  private options: GifExportOptions;

  constructor(options: Partial<GifExportOptions> = {}) {
    this.options = { ...DEFAULT_GIF_OPTIONS, ...options };
  }

  addFrame(frame: GifFrame) {
    this.frames.push(frame);
  }

  async encode(): Promise<Blob> {
    if (this.frames.length === 0) {
      throw new Error('No frames to encode');
    }

    const { width, height, loop } = this.options;
    const output: number[] = [];
    
    // Helper to write bytes
    const writeByte = (b: number) => output.push(b & 0xFF);
    const writeWord = (w: number) => {
      output.push(w & 0xFF);
      output.push((w >> 8) & 0xFF);
    };
    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        output.push(s.charCodeAt(i));
      }
    };
    
    // GIF Header
    writeString('GIF89a');
    
    // Logical Screen Descriptor
    writeWord(width);
    writeWord(height);
    writeByte(0x70); // Global color table flag = 0, color resolution = 7
    writeByte(0);    // Background color index
    writeByte(0);    // Pixel aspect ratio
    
    // Netscape Looping Application Extension (for animated GIFs)
    if (loop) {
      writeByte(0x21); // Extension introducer
      writeByte(0xFF); // Application extension
      writeByte(0x0B); // Block size
      writeString('NETSCAPE2.0');
      writeByte(0x03); // Sub-block size
      writeByte(0x01); // Loop indicator
      writeWord(0);    // Loop count (0 = infinite)
      writeByte(0x00); // Block terminator
    }
    
    // Process each frame
    for (const frame of this.frames) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      
      // Draw frame to canvas
      if (frame.imageData instanceof HTMLCanvasElement) {
        ctx.drawImage(frame.imageData, 0, 0, width, height);
      } else if (frame.imageData instanceof HTMLImageElement) {
        ctx.drawImage(frame.imageData, 0, 0, width, height);
      } else {
        ctx.putImageData(frame.imageData as ImageData, 0, 0);
      }
      
      const imageData = ctx.getImageData(0, 0, width, height);
      const { palette, indexed } = quantizeColors(imageData.data, 256);
      
      const colorTableSize = palette.length;
      const colorTableBits = Math.ceil(Math.log2(colorTableSize));
      
      // Graphic Control Extension
      writeByte(0x21); // Extension introducer
      writeByte(0xF9); // Graphic control label
      writeByte(0x04); // Block size
      writeByte(0x00); // Disposal method, no transparency
      writeWord(Math.round(frame.delay / 10)); // Delay in centiseconds
      writeByte(0x00); // Transparent color index
      writeByte(0x00); // Block terminator
      
      // Image Descriptor
      writeByte(0x2C); // Image separator
      writeWord(0);    // Left position
      writeWord(0);    // Top position
      writeWord(width);
      writeWord(height);
      writeByte(0x80 | (colorTableBits - 1)); // Local color table flag
      
      // Local Color Table
      for (const color of palette) {
        writeByte(color[0]);
        writeByte(color[1]);
        writeByte(color[2]);
      }
      
      // Image Data
      const minCodeSize = Math.max(2, colorTableBits);
      writeByte(minCodeSize);
      
      const lzwData = lzwEncode(indexed, minCodeSize);
      
      // Write in sub-blocks
      let pos = 0;
      while (pos < lzwData.length) {
        const blockSize = Math.min(255, lzwData.length - pos);
        writeByte(blockSize);
        for (let i = 0; i < blockSize; i++) {
          writeByte(lzwData[pos++]);
        }
      }
      writeByte(0x00); // Block terminator
    }
    
    // GIF Trailer
    writeByte(0x3B);
    
    return new Blob([new Uint8Array(output)], { type: 'image/gif' });
  }

  clear() {
    this.frames = [];
  }
}

// Export scene as GIF
export async function exportSceneAsGif(
  captureFunction: () => Promise<HTMLCanvasElement>,
  duration: number, // ms
  options: Partial<GifExportOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_GIF_OPTIONS, ...options };
  const encoder = new GifEncoder(opts);
  const frameCount = Math.ceil((duration / 1000) * opts.fps);
  const frameDelay = 1000 / opts.fps;

  for (let i = 0; i < frameCount; i++) {
    const canvas = await captureFunction();
    encoder.addFrame({
      imageData: canvas,
      delay: frameDelay,
    });
  }

  return encoder.encode();
}

// Download blob as file
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download data URL as file
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate share link (placeholder - would need backend)
export interface ShareLinkOptions {
  projectId: string;
  expiresIn?: number; // hours
  allowEdit?: boolean;
}

export async function generateShareLink(options: ShareLinkOptions): Promise<string> {
  // In production, this would call an API to create a share link
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cartoon-studio.app';
  const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Placeholder implementation
  return `${baseUrl}/view/${shareId}?project=${options.projectId}`;
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Generate project cover image from first scene
export async function generateCoverImage(
  firstSceneElement: HTMLElement | null,
  projectTitle: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630; // Social media preview size
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Try to capture scene
  if (firstSceneElement) {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const sceneCanvas = await html2canvas(firstSceneElement, {
        width: 800,
        height: 450,
        scale: 1,
      });
      
      // Draw scene in center
      const x = (canvas.width - 800) / 2;
      const y = 50;
      ctx.drawImage(sceneCanvas, x, y);
      
      // Add border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, 800, 450);
    } catch (error) {
      console.warn('Could not capture scene for cover');
    }
  }

  // Add title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(projectTitle, canvas.width / 2, canvas.height - 80);

  // Add branding
  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('Created with Cartoon Studio', canvas.width / 2, canvas.height - 40);

  return canvas.toDataURL('image/png', 0.9);
}
