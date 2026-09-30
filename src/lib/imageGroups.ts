// A rehype plugin for blog posts: each run of two or more consecutive
// paragraphs that hold nothing but a single image is replaced by one
// <div class="post-image-group"> containing those images, so the post view
// can lay them out as a grid. The Markdown itself is unchanged; a lone
// image stays in its paragraph, and anything else (text, a caption, an
// image with words beside it) ends a run.

// The parts of the hast tree this touches (react-markdown's HTML syntax
// tree), declared here rather than importing its types package.
type Text = { type: 'text'; value: string }
type Element = { type: 'element'; tagName: string; properties?: Record<string, unknown>; children: Node[] }
type Node = Text | Element | { type: string }
type Parent = { children: Node[] }

export const IMAGE_GROUP_CLASS = 'post-image-group'

const isElement = (node: Node): node is Element => node.type === 'element'
const isBlank = (node: Node) => node.type === 'text' && !(node as Text).value.trim()

// The image, if `node` is a paragraph holding only that one image.
function soleImage(node: Node): Element | null {
  if (!isElement(node) || node.tagName !== 'p') return null
  const content = node.children.filter((child) => !isBlank(child))
  const [only] = content
  return content.length === 1 && isElement(only) && only.tagName === 'img' ? only : null
}

// Groups image runs among the tree's top-level blocks, in place.
export function groupImages(tree: Parent) {
  const out: Node[] = []
  let run: Element[] = []
  // Blank text between the run's paragraphs, kept only if the run isn't
  // grouped (a single image stays exactly as it was).
  let between: Node[] = []

  const flush = () => {
    if (run.length >= 2) {
      const images = run.map((paragraph) => soleImage(paragraph) as Element)
      out.push({ type: 'element', tagName: 'div', properties: { className: [IMAGE_GROUP_CLASS] }, children: images })
    } else {
      out.push(...run)
    }
    out.push(...between)
    run = []
    between = []
  }

  for (const node of tree.children) {
    if (soleImage(node)) {
      if (run.length > 0) between = []
      run.push(node as Element)
    } else if (run.length > 0 && isBlank(node)) {
      between.push(node)
    } else {
      flush()
      out.push(node)
    }
  }
  flush()
  tree.children = out
}

export function rehypeImageGroups() {
  return (tree: Parent) => groupImages(tree)
}
