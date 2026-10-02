export type BlogPost = {
  title: string
  slug: string
  image: string
  // Raster (PNG/JPG) link-preview image; see postOgImagePath() in lib/blog.ts.
  ogImage?: string
  blurb: string
  date: string
  author?: string
  // A short dated note shown above the body, e.g. "Update, October 2026:
  // ...", so a post can be corrected without editing its text.
  update?: string
  tags: string[]
  body: string
}
