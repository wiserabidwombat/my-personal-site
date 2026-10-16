const amazonHost = /^(?:www\.|smile\.|m\.)?amazon\.(com|ca|co\.uk|de|fr|it|es|com\.au|co\.jp|in)$/i
export function productLink(value: string): { url: string; key: string; suggestedName: string; short: boolean } {
  if (!value.trim()) return { url: '', key: '', suggestedName: '', short: false }
  const u = new URL(value.trim())
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || u.port) throw Error('Use a normal https:// product link.')
  u.protocol = 'https:'; u.hash = ''
  if (amazonHost.test(u.hostname)) {
    const asin = u.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([a-z0-9]{10})(?:\/|$)/i)?.[1]?.toUpperCase()
    const slug = u.pathname.match(/^\/([^/]+)\/(?:dp|gp\/product)\//i)?.[1]
    const suggestedName = slug ? decodeURIComponent(slug).replace(/[-_]+/g, ' ').slice(0, 150) : ''
    if (asin) return { url: `https://www.${u.hostname.replace(/^(www\.|smile\.|m\.)/i, '')}/dp/${asin}`, key: `amazon:${asin}`, suggestedName, short: false }
  }
  const short = ['amzn.to', 'a.co'].includes(u.hostname.toLowerCase())
  for (const key of [...u.searchParams.keys()]) if (/^(utm_|ref|tag$|linkCode$|camp$|creative$)/i.test(key)) u.searchParams.delete(key)
  return { url: u.toString(), key: u.toString().replace(/\/$/, ''), suggestedName: '', short }
}
export function sharedProduct(text: string, title = '', url = '') {
  const extracted = url || text.match(/https?:\/\/[^\s<>]+/i)?.[0]?.replace(/[),.;]+$/, '') || ''
  const product = productLink(extracted)
  // Only use explicitly dollar-denominated shared prices; never infer a product price from digits in a URL.
  const price = text.replace(/https?:\/\/\S+/g, '').match(/\$\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)(?![\d.])/)
  const name = title.replace(/^Amazon\.com\s*:\s*/i, '').trim() || product.suggestedName
  return { ...product, name: name.slice(0, 150), price: price ? Number(price[1].replace(/,/g, '')).toFixed(2) : '' }
}
