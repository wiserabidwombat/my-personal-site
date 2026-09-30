import { describe, expect, it } from 'vitest'
import { splitHoistedTags, withBuiltAssetUrls } from './prerender-html.mjs'

describe('splitHoistedTags', () => {
  it('moves the tags React hoisted to the front of the body out of it', () => {
    const preload = '<link rel="preload" as="image" href="/a.webp" fetchPriority="high"/>'
    const { hoisted, body } = splitHoistedTags(`${preload}<div class="page"><p>Hi</p></div>`)
    expect(hoisted).toBe(preload)
    expect(body).toBe('<div class="page"><p>Hi</p></div>')
  })

  it('takes a whole run of hoisted tags, and only from the very start', () => {
    const { hoisted, body } = splitHoistedTags('<link rel="a"/><meta name="b" content="c"/><div><link rel="kept"/></div>')
    expect(hoisted).toBe('<link rel="a"/><meta name="b" content="c"/>')
    expect(body).toBe('<div><link rel="kept"/></div>')
  })

  it('leaves a body with nothing hoisted unchanged', () => {
    expect(splitHoistedTags('<div>Hi</div>')).toEqual({ hoisted: '', body: '<div>Hi</div>' })
  })
})

describe('withBuiltAssetUrls', () => {
  const manifest = {
    'src/assets/dallas-skyline.webp': { file: 'assets/dallas-skyline-DINbkw2M.webp' },
    'src/assets/board-game.jpg': { file: 'assets/board-game-CoosXczJ.jpg' },
  }

  it('replaces every dev-loader asset path with the built file', () => {
    const html = '<img src="/src/assets/dallas-skyline.webp"/><link href="/src/assets/dallas-skyline.webp"/><img src="/src/assets/board-game.jpg">'
    expect(withBuiltAssetUrls(html, manifest)).toBe(
      '<img src="/assets/dallas-skyline-DINbkw2M.webp"/><link href="/assets/dallas-skyline-DINbkw2M.webp"/><img src="/assets/board-game-CoosXczJ.jpg">',
    )
  })

  it('leaves public-folder URLs alone', () => {
    const html = '<img src="/blog/jerky/round-one.jpg"><img src="/images/headshot.jpg">'
    expect(withBuiltAssetUrls(html, manifest)).toBe(html)
  })

  it('throws on an asset the manifest does not list, instead of shipping a broken URL', () => {
    expect(() => withBuiltAssetUrls('<img src="/src/assets/missing.png">', manifest)).toThrow(/missing\.png/)
  })
})
