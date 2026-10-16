import { afterEach, describe, expect, it, vi } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import handler from './garden-product'
async function request(url: string, method = 'GET') {
  let code = 200, body: unknown
  const res = { setHeader: vi.fn(), status(n: number) { code = n; return this }, json(value: unknown) { body = value; return this } } as unknown as VercelResponse
  await handler({ method, query: { url } } as unknown as VercelRequest, res)
  return { code, body }
}
afterEach(() => vi.unstubAllGlobals())
describe('Amazon short link resolver', () => {
  it('rejects arbitrary hosts and unsupported methods without fetching', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
    expect((await request('https://localhost/secrets')).code).toBe(400)
    expect((await request('https://amzn.to/link', 'POST')).code).toBe(405)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('checks every redirect before following it', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://127.0.0.1/secrets' } }))
    vi.stubGlobal('fetch', fetcher)
    expect((await request('https://amzn.to/link')).code).toBe(422)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('returns only a product destination on an allowed Amazon host', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'https://www.amazon.com/Desk-Lamp/dp/B012345678' } })).mockResolvedValueOnce(new Response(null, { status: 200 })))
    expect(await request('https://amzn.to/link')).toEqual({ code: 200, body: { url: 'https://www.amazon.com/Desk-Lamp/dp/B012345678' } })
  })
})
