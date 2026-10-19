import { describe, expect, it } from 'vitest'
import { productLink, sharedProduct } from './products'
describe('product capture', () => {
  it('matches Amazon ASINs across URL formats, tracking tags, and marketplaces', () => {
    const a = productLink('https://www.amazon.com/Excellent-Desk-Lamp/dp/B012345678/ref=abc?tag=shop-20')
    const b = productLink('https://amazon.co.uk/gp/product/b012345678?ref_=stuff')
    expect(a.key).toBe(b.key); expect(a.url).toBe('https://www.amazon.com/dp/B012345678')
    expect(a.suggestedName).toBe('Excellent Desk Lamp')
  })
  it('does not mistake spoofed Amazon hosts for Amazon products', () => {
    expect(productLink('https://amazon.com.evil.test/dp/B012345678').key).not.toBe('amazon:B012345678')
  })
  it('rejects unsafe protocols, embedded credentials, and custom ports', () => {
    for (const value of ['javascript:alert(1)', 'https://user:pass@amazon.com/dp/B012345678', 'https://amazon.com:8888/dp/B012345678']) expect(() => productLink(value)).toThrow()
  })
  it('extracts explicit shared prices but never guesses from URL digits', () => {
    expect(sharedProduct('I like this for $1,299.99 https://amazon.com/dp/B012345678', 'A lamp').price).toBe('1299.99')
    expect(sharedProduct('https://amazon.com/dp/B012345678?price=1299').price).toBe('')
    expect(sharedProduct('https://amzn.to/example').short).toBe(true)
  })
})
