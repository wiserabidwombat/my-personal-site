import { describe, expect, it } from 'vitest'
import { decodeEntities } from './games'

describe('decodeEntities', () => {
  it('decodes the named and numeric entities BGG descriptions contain', () => {
    expect(decodeEntities('charlatans &mdash; or quack doctors &rsquo;s brew&hellip;')).toBe('charlatans — or quack doctors ’s brew…')
    expect(decodeEntities('M&uuml;nchen&#10;&#10;Line &#x2019;two')).toBe('München\n\nLine ’two')
  })

  it('leaves unknown entities and plain ampersands alone', () => {
    expect(decodeEntities('Tom & Jerry &madeup;')).toBe('Tom & Jerry &madeup;')
  })
})
