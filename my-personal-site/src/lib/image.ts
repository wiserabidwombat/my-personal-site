export type ImageSize = 'thumbnail' | 'medium' | 'large'

const DIMENSIONS: Record<Exclude<ImageSize, 'large'>, { w: number; h: number }> = {
  thumbnail: { w: 150, h: 150 },
  medium: { w: 500, h: 500 },
}

// wsrv.nl (weserv.nl) is a free image resizing/caching proxy: given any
// public image URL, it returns a resized version via query params. Used so
// the Vercel Blob store only ever needs to hold one full-size original per
// upload -- thumbnail/medium variants are generated on request rather than
// stored as separate files.
export function getResizedImageUrl(originalUrl: string, size: ImageSize): string {
  if (size === 'large') return originalUrl

  const { w, h } = DIMENSIONS[size]
  // URLSearchParams percent-encodes the nested `url` value for us.
  const params = new URLSearchParams({
    url: originalUrl,
    w: String(w),
    h: String(h),
    fit: 'cover',
  })
  return `https://wsrv.nl/?${params.toString()}`
}
