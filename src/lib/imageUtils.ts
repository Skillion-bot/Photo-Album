/**
 * Utilities for handling client-side image processing and compression.
 * Specifically designed to keep base64 strings under Firestore's 1MB limit.
 */

const MAX_FIRESTORE_SIZE = 1048487; // Just under 1MB

/**
 * Compresses an image file until it fits within the specified byte limit.
 */
export async function compressImage(file: File, maxSizeBytes: number = MAX_FIRESTORE_SIZE): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const result = processImage(img, maxSizeBytes);
        resolve(result);
      };
      img.onerror = (err) => reject(new Error('Failed to load image for processing'));
    };
    reader.onerror = (err) => reject(new Error('Failed to read file'));
  });
}

/**
 * Uses a canvas to resize and compress an image recursively until it's small enough.
 */
async function processImage(img: HTMLImageElement, maxSizeBytes: number): Promise<string> {
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;

  // Max dimension 1600px as requested
  const MAX_DIMENSION = 1600;
  if (width > height) {
    if (width > MAX_DIMENSION) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    }
  } else {
    if (height > MAX_DIMENSION) {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.9;
  let base64 = canvas.toDataURL('image/jpeg', quality);

  // Recursively reduce quality if still too large
  // A rough estimate of base64 size is (bytes * 4/3)
  while (base64.length > maxSizeBytes && quality > 0.1) {
    quality -= 0.1;
    base64 = canvas.toDataURL('image/jpeg', quality);
  }

  // If still too large after quality reduction, downscale further
  if (base64.length > maxSizeBytes) {
    const newImg = new Image();
    newImg.src = base64;
    await new Promise(r => newImg.onload = r);
    return processImage(newImg, maxSizeBytes);
  }

  return base64;
}
