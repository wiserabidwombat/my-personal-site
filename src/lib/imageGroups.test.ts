import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import { describe, expect, it } from 'vitest'
import { getPostBySlug } from './blog'
import { groupImages, IMAGE_GROUP_CLASS, rehypeImageGroups } from './imageGroups'

const text = (value: string) => ({ type: 'text', value })
const img = (src: string) => ({ type: 'element', tagName: 'img', properties: { src }, children: [] })
const p = (...children: object[]) => ({ type: 'element', tagName: 'p', children })
const imageP = (src: string) => p(img(src))

// A readable summary of the top-level blocks: "p", "img-p", or "group(a,b)".
function shape(children: object[]): string[] {
  return children
    .filter((node) => (node as { type: string }).type === 'element')
    .map((node) => {
      const el = node as { tagName: string; properties?: { className?: string[] }; children: { properties?: { src?: string }; tagName?: string }[] }
      if (el.tagName === 'div' && el.properties?.className?.includes(IMAGE_GROUP_CLASS)) {
        return `group(${el.children.map((child) => child.properties?.src).join(',')})`
      }
      return el.tagName === 'p' && el.children.some((child) => child.tagName === 'img') ? 'img-p' : el.tagName
    })
}

describe('groupImages', () => {
  it('groups a run of image-only paragraphs, skipping the blank lines between them', () => {
    const tree = { children: [p(text('Intro')), text('\n'), imageP('a'), text('\n'), imageP('b'), text('\n'), imageP('c'), text('\n'), p(text('After'))] }
    groupImages(tree)
    expect(shape(tree.children)).toEqual(['p', 'group(a,b,c)', 'p'])
  })

  it('leaves a lone image in its paragraph', () => {
    const tree = { children: [p(text('Intro')), text('\n'), imageP('a'), text('\n'), p(text('After'))] }
    const before = JSON.stringify(tree)
    groupImages(tree)
    expect(JSON.stringify(tree)).toBe(before)
  })

  it('ends a run at anything else: text, a heading, or an image with words beside it', () => {
    const tree = {
      children: [
        imageP('a'),
        imageP('b'),
        p(text('Between')),
        imageP('c'),
        { type: 'element', tagName: 'h2', children: [text('Next')] },
        imageP('d'),
        p(img('e'), text(' a caption')),
        imageP('f'),
        imageP('g'),
      ],
    }
    groupImages(tree)
    expect(shape(tree.children)).toEqual(['group(a,b)', 'p', 'img-p', 'h2', 'img-p', 'img-p', 'group(f,g)'])
  })
})

describe('rehypeImageGroups on the beef jerky post', () => {
  it('groups its photo runs (4, 4 and 5) and keeps the lone photo as it was', () => {
    const post = getPostBySlug('three-rounds-of-beef-jerky')
    expect(post).toBeDefined()
    const html = renderToStaticMarkup(createElement(ReactMarkdown, { rehypePlugins: [rehypeImageGroups] }, post!.body))
    const groups = html.split(`<div class="${IMAGE_GROUP_CLASS}">`).slice(1)
    expect(groups.map((group) => group.split('</div>')[0].match(/<img /g)?.length)).toEqual([4, 4, 5])
    expect(html.match(/<img /g)).toHaveLength(14)
    expect(html).toContain('<p><img src="/blog/jerky/round-two-on-the-smoker.jpg"')
  })
})
