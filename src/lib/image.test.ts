import { describe, expect, it } from 'vitest'
import { getResizedImageUrl } from './image'

const original = 'https://my-store.public.blob.vercel-storage.com/specimens/trilobite-abc123.jpg'

describe('getResizedImageUrl', () => {
  it('returns the original URL unchanged for "large"', () => {
    expect(getResizedImageUrl(original, 'large')).toBe(original)
  })

  it('builds a wsrv.nl thumbnail URL at 150x150 with fit=cover', () => {
    const url = new URL(getResizedImageUrl(original, 'thumbnail'))
    expect(url.origin + url.pathname).toBe('https://wsrv.nl/')
    expect(url.searchParams.get('url')).toBe(original)
    expect(url.searchParams.get('w')).toBe('150')
    expect(url.searchParams.get('h')).toBe('150')
    expect(url.searchParams.get('fit')).toBe('cover')
  })

  it('builds a wsrv.nl medium URL at 500x500 with fit=cover', () => {
    const url = new URL(getResizedImageUrl(original, 'medium'))
    expect(url.searchParams.get('url')).toBe(original)
    expect(url.searchParams.get('w')).toBe('500')
    expect(url.searchParams.get('h')).toBe('500')
    expect(url.searchParams.get('fit')).toBe('cover')
  })

  it('URL-encodes the original URL within the wsrv.nl query string', () => {
    const result = getResizedImageUrl(original, 'thumbnail')
    // The nested URL's own "://" and "/" must be percent-encoded so it
    // survives as a single query value rather than being parsed as part of
    // the outer wsrv.nl URL's path/query structure.
    expect(result).toContain(encodeURIComponent(original))
    expect(result.startsWith('https://wsrv.nl/?')).toBe(true)
  })

  it('round-trips a URL containing special characters', () => {
    const tricky = 'https://example.com/specimens/name with spaces & stuff.jpg?token=abc=='
    const url = new URL(getResizedImageUrl(tricky, 'medium'))
    expect(url.searchParams.get('url')).toBe(tricky)
  })
})
