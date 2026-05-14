const PENDING_UPLOAD_PREFIX = 'db-upload:';

function hasImageData(data: Buffer | Uint8Array | ArrayBuffer | null | undefined) {
  if (!data) {
    return false;
  }

  if (data instanceof ArrayBuffer) {
    return data.byteLength > 0;
  }

  return data.byteLength > 0;
}

export function isPendingBookCoverUploadToken(value: string | null | undefined) {
  return Boolean(value && value.startsWith(PENDING_UPLOAD_PREFIX));
}

export function parsePendingBookCoverUploadToken(value: string | null | undefined) {
  if (!value || !value.startsWith(PENDING_UPLOAD_PREFIX)) {
    return null;
  }

  const token = value.slice(PENDING_UPLOAD_PREFIX.length).trim();
  return token || null;
}

export function parsePendingBookCoverUploadId(value: string | null | undefined) {
  const token = parsePendingBookCoverUploadToken(value);

  if (!token) {
    return null;
  }

  const id = Number(token);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function buildBookCoverImageSrc(
  bookId: number,
  coverImage: string | null,
  coverImageData: Buffer | Uint8Array | ArrayBuffer | null | undefined
) {
  if (hasImageData(coverImageData)) {
    return `/api/books/${bookId}/image`;
  }

  if (!coverImage) {
    return null;
  }

  if (coverImage.startsWith('/') || coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }

  return `/images/${coverImage}`;
}