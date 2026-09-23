export type BlogPost = {
  title: string
  slug: string
  image: string
  // Raster (PNG/JPG) link-preview image; see postOgImagePath() in lib/blog.ts.
  ogImage?: string
  blurb: string
  date: string
  author?: string
  tags: string[]
  body: string
}
