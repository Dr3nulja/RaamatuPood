import { prisma } from '@/lib/prisma';

type UploadResult = {
  url: string;
};

export function isStorageUploadConfigured() {
  return false;
}

export async function uploadImageToStorage(file: File): Promise<UploadResult> {
  const data = Buffer.from(await file.arrayBuffer());
  const uploaded = await prisma.pendingBookCoverUpload.create({
    data: {
      imageData: data,
      mimeType: file.type || 'application/octet-stream',
    },
  });

  return { url: `db-upload:${uploaded.id}` };
}
