import type { VercelRequest, VercelResponse } from '@vercel/node'

// Resolve only Amazon short links. Do not fetch arbitrary hosts, HTML, images, or prices.
const allowed = (url: URL) => url.protocol === 'https:' && !url.port && !url.username && !url.password && /^(?:(?:www\.|smile\.|m\.)?amazon\.(?:com|ca|co\.uk|de|fr|it|es|com\.au|co\.jp|in)|amzn\.to|a\.co)$/i.test(url.hostname)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' })
  try {
    if (typeof req.query.url !== 'string' || req.query.url.length > 2048) return res.status(400).json({ error: 'Invalid link.' })
    let url = new URL(req.query.url)
    if (!allowed(url) || !['amzn.to', 'a.co'].includes(url.hostname)) return res.status(400).json({ error: 'Use an Amazon short link.' })
    const signal = AbortSignal.timeout(6000)
    for (let n = 0; n < 5; n++) {
      if (!allowed(url)) throw Error('Unsupported redirect')
      const response = await fetch(url, { method: 'HEAD', redirect: 'manual', signal })
      const location = response.headers.get('location')
      if (response.status >= 300 && response.status < 400 && location) { url = new URL(location, url); continue }
      if (response.ok && /amazon\./i.test(url.hostname) && /\/(dp|gp\/product|gp\/aw\/d)\/[a-z0-9]{10}/i.test(url.pathname)) return res.json({ url: url.toString() })
      throw Error('No product destination')
    }
    throw Error('Too many redirects')
  } catch { return res.status(422).json({ error: 'Could not expand this link. Open it in your browser and paste the full product address, or enter details manually.' }) }
}
