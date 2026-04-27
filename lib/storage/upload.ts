import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

type UploadResult = {
  url: string;
};

function getStorageUploadEndpoint() {
  return process.env.STORAGE_UPLOAD_ENDPOINT?.trim() || '';
}

export function isStorageUploadConfigured() {
  return Boolean(getStorageUploadEndpoint());
}

async function uploadToExternalProvider(file: File): Promise<UploadResult> {
  const endpoint = getStorageUploadEndpoint();

  if (!endpoint) {
    throw new Error('External upload server is not configured. Falling back to local storage.');
  }

  const formData = new FormData();
  formData.set('file', file);

  const token = process.env.STORAGE_UPLOAD_TOKEN?.trim();
  const headers: HeadersInit = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as
    | { url?: string; secure_url?: string; data?: { url?: string; secure_url?: string } }
    | null;

  if (!response.ok) {
    throw new Error('External server rejected the upload.');
  }

  const url = payload?.url || payload?.secure_url || payload?.data?.url || payload?.data?.secure_url;

  if (!url || typeof url !== 'string') {
    throw new Error('External server did not return a file URL.');
  }

  return { url: url.trim() };
}

async function uploadToLocalStorage(file: File): Promise<UploadResult> {
  try {
    // Create uploads directory structure
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'books');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${randomStr}_${originalName}`;
    const filePath = path.join(uploadsDir, filename);

    // Convert File to Buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Return public URL path
    return { url: `/uploads/books/${filename}` };
  } catch (error) {
    throw new Error(`Local upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadImageToStorage(file: File): Promise<UploadResult> {
  // Try external provider first if configured
  if (isStorageUploadConfigured()) {
    try {
      return await uploadToExternalProvider(file);
    } catch (externalError) {
      console.warn('External upload failed, falling back to local storage:', externalError);
      // Fall through to local storage
    }
  }

  // Fallback to local storage
  return uploadToLocalStorage(file);
}
