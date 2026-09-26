import { MarkerType, type Node, type Edge, type SmoothStepPathOptions } from '@xyflow/react'
import type { IconSvgElement } from '@hugeicons/react'
import {
  BrowserIcon,
  Atom01Icon,
  TriangleIcon,
  Notion01Icon,
  DatabaseLightningIcon,
  Book01Icon,
  MusicNote01Icon,
  ChessIcon,
  Image01Icon,
  ImageCropIcon,
  LaptopIcon,
  GithubIcon,
  Settings01Icon,
  GitPullRequestIcon,
  Rocket01Icon,
  Idea01Icon,
  File01Icon,
  AiBrain02Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import type { StackLayout } from './StackFlowDiagram'
import { accentStyles, type Accent, type StackNodeData } from './stackFlowTheme'

// Every box has a fixed size, so the layouts below can space them with a
// guaranteed gap (and room for an arrowhead) instead of relying on a label's
// wrapped height.
const W = 160
const H = 88

function node(
  id: string,
  x: number,
  y: number,
  data: { label: string; icon: IconSvgElement; accent: Accent; steps?: string[] },
  size: { width?: number; height?: number } = {},
): Node<StackNodeData> {
  return { id, type: 'stackNode', position: { x, y }, width: size.width ?? W, height: size.height ?? H, data }
}

type EdgeOptions = {
  from?: string
  to?: string
  accent?: Accent
  dashed?: boolean
  label?: string
  // Where along the gap a stepped edge turns (0-1). Branches that leave one
  // box get different values so their segments never overlap.
  step?: number
  offset?: number
}

// ReactFlow's generic Edge type doesn't declare the smoothstep-only options.
type StepEdge = Edge & { type: 'smoothstep'; pathOptions: SmoothStepPathOptions }

function edge(id: string, source: string, target: string, options: EdgeOptions = {}): StepEdge {
  const stroke = accentStyles[options.accent ?? 'cyan'].stroke
  return {
    id,
    source,
    target,
    sourceHandle: options.from ?? 'out-bottom',
    targetHandle: options.to ?? 'in-top',
    type: 'smoothstep',
    pathOptions: { stepPosition: options.step ?? 0.5, offset: options.offset ?? 20, borderRadius: 8 },
    style: { stroke, strokeWidth: 2, ...(options.dashed ? { strokeDasharray: '6 4' } : {}) },
    markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 18, height: 18 },
    ...(options.label
      ? {
          label: options.label,
          labelStyle: { fill: '#cbd5e1', fontSize: 11 },
          labelBgStyle: { fill: 'var(--deep-space-black)' },
          labelBgPadding: [6, 3] as [number, number],
        }
      : {}),
  }
}

// ---------------------------------------------------------------------------
// Data flow (top-down). Vercel's API routes branch to the four sources the
// site reads at request time. Each branch leaves Vercel from its own point
// and the outer branches turn earlier than the inner ones, so no two lines
// share a segment or cross. Only the minerals & fossils path touches image
// storage. BoardGameGeek is not called at request time: `npm run sync:bgg`
// copies its data into Notion, shown as a dashed arrow.
// ---------------------------------------------------------------------------

const COL = W + 48 // column pitch
const cx = (column: number) => column * COL // left edge of a source column
const centerX = (COL * 3 + W) / 2 - W / 2 // centered above the four columns

const dataNodes = {
  browser: { label: 'Browser', icon: BrowserIcon, accent: 'pink' as const },
  app: { label: 'React + TanStack Router', icon: Atom01Icon, accent: 'cyan' as const },
  vercel: { label: 'Vercel (API Routes)', icon: TriangleIcon, accent: 'pink' as const },
  notion: { label: 'Notion', icon: Notion01Icon, accent: 'purple' as const },
  neon: { label: 'Neon Postgres', icon: DatabaseLightningIcon, accent: 'cyan' as const },
  hardcover: { label: 'Hardcover', icon: Book01Icon, accent: 'purple' as const },
  spotify: { label: 'Spotify Web API', icon: MusicNote01Icon, accent: 'pink' as const },
  bgg: { label: 'BoardGameGeek', icon: ChessIcon, accent: 'purple' as const },
  blob: { label: 'Vercel Blob', icon: Image01Icon, accent: 'cyan' as const },
  wsrv: { label: 'wsrv.nl (resize)', icon: ImageCropIcon, accent: 'pink' as const },
}

const syncEdge = (from: string, to: string) =>
  edge('bgg-notion', 'bgg', 'notion', { from, to, accent: 'purple', dashed: true, label: 'npm run sync:bgg' })

const sharedDataEdges = [
  edge('browser-app', 'browser', 'app'),
  edge('app-vercel', 'app', 'vercel'),
  edge('neon-blob', 'neon', 'blob'),
  edge('blob-wsrv', 'blob', 'wsrv'),
]

// Mobile: the app chain runs down the left, the sources down a column on
// the right. Each branch drops on its own vertical line and turns right into
// its source; the first source takes the rightmost line and each later one
// the next line left, so a branch never crosses another's line.
const SRC_X = W + 40
const srcY = (row: number) => 432 + row * 144

export const dataFlowLayouts: { desktop: StackLayout; mobile: StackLayout } = {
  desktop: {
    nodes: [
      node('browser', centerX, 0, dataNodes.browser),
      node('app', centerX, 144, dataNodes.app),
      node('vercel', centerX, 288, dataNodes.vercel),
      node('notion', cx(0), 472, dataNodes.notion),
      node('neon', cx(1), 472, dataNodes.neon),
      node('hardcover', cx(2), 472, dataNodes.hardcover),
      node('spotify', cx(3), 472, dataNodes.spotify),
      node('bgg', cx(0), 640, dataNodes.bgg),
      node('blob', cx(1), 640, dataNodes.blob),
      node('wsrv', cx(1), 784, dataNodes.wsrv),
    ],
    edges: [
      ...sharedDataEdges,
      edge('vercel-notion', 'vercel', 'notion', { from: 'out-bottom-20', step: 0.3 }),
      edge('vercel-neon', 'vercel', 'neon', { from: 'out-bottom-40', step: 0.7 }),
      edge('vercel-hardcover', 'vercel', 'hardcover', { from: 'out-bottom-60', step: 0.7 }),
      edge('vercel-spotify', 'vercel', 'spotify', { from: 'out-bottom-80', step: 0.3 }),
      syncEdge('out-top', 'in-bottom'),
    ],
  },
  mobile: {
    nodes: [
      node('browser', 0, 0, dataNodes.browser),
      node('app', 0, 144, dataNodes.app),
      node('vercel', 0, 288, dataNodes.vercel),
      node('bgg', SRC_X, 288, dataNodes.bgg),
      node('notion', SRC_X, srcY(0), dataNodes.notion),
      node('hardcover', SRC_X, srcY(1), dataNodes.hardcover),
      node('spotify', SRC_X, srcY(2), dataNodes.spotify),
      node('neon', SRC_X, srcY(3), dataNodes.neon),
      node('blob', SRC_X, srcY(4), dataNodes.blob),
      node('wsrv', SRC_X, srcY(5), dataNodes.wsrv),
    ],
    edges: [
      ...sharedDataEdges,
      edge('vercel-notion', 'vercel', 'notion', { from: 'out-bottom-80', to: 'in-left' }),
      edge('vercel-hardcover', 'vercel', 'hardcover', { from: 'out-bottom-60', to: 'in-left' }),
      edge('vercel-spotify', 'vercel', 'spotify', { from: 'out-bottom-40', to: 'in-left' }),
      edge('vercel-neon', 'vercel', 'neon', { from: 'out-bottom-20', to: 'in-left' }),
      syncEdge('out-bottom', 'in-top'),
    ],
  },
}

// ---------------------------------------------------------------------------
// Build & deploy. The Vercel build box lists the build command's steps in
// the order package.json runs them; the branch alone decides preview vs.
// production. Left to right on desktop, top to bottom on mobile.
// ---------------------------------------------------------------------------

const buildSteps = [
  'Tests (vitest run)',
  'Type check (tsc -b)',
  'RSS feed (generate-rss)',
  'Production build (vite build)',
  'Prerender pages (prerender-meta)',
]
const BUILD = { width: 272, height: 196 }
const buildData = { label: 'Vercel Build', icon: Settings01Icon, accent: 'pink' as const, steps: buildSteps }
const localData = { label: 'Local Changes', icon: LaptopIcon, accent: 'purple' as const }
const githubData = { label: 'GitHub (push / PR)', icon: GithubIcon, accent: 'cyan' as const }
const previewData = { label: 'Preview Deployment', icon: GitPullRequestIcon, accent: 'purple' as const }
const productionData = { label: 'Production (aarontilley.me)', icon: Rocket01Icon, accent: 'pink' as const }

const buildMidY = BUILD.height / 2

export const buildDeployLayouts: { desktop: StackLayout; mobile: StackLayout } = {
  desktop: {
    nodes: [
      node('local', 0, buildMidY - H / 2, localData),
      node('github', 216, buildMidY - H / 2, githubData),
      node('build', 432, 0, buildData, BUILD),
      node('preview', 432 + BUILD.width + 72, 0, previewData),
      node('production', 432 + BUILD.width + 72, BUILD.height - H, productionData),
    ],
    edges: [
      edge('local-github', 'local', 'github', { from: 'out-right', to: 'in-left' }),
      edge('github-build', 'github', 'build', { from: 'out-right', to: 'in-left' }),
      edge('build-preview', 'build', 'preview', { from: 'out-right-30', to: 'in-left', accent: 'purple' }),
      edge('build-production', 'build', 'production', { from: 'out-right-70', to: 'in-left', accent: 'pink' }),
    ],
  },
  mobile: {
    nodes: [
      node('local', 40 + BUILD.width / 2 - W / 2, 0, localData),
      node('github', 40 + BUILD.width / 2 - W / 2, 144, githubData),
      node('build', 40, 288, buildData, BUILD),
      // Preview and production sit outside the two branch lines (30% and
      // 70% across the build box) so each branch turns away from the other.
      node('preview', 0, 288 + BUILD.height + 72, previewData),
      node('production', W + 16, 288 + BUILD.height + 72, productionData),
    ],
    edges: [
      edge('local-github', 'local', 'github'),
      edge('github-build', 'github', 'build'),
      edge('build-preview', 'build', 'preview', { from: 'out-bottom-30', accent: 'purple' }),
      edge('build-production', 'build', 'production', { from: 'out-bottom-70', accent: 'pink' }),
    ],
  },
}

// ---------------------------------------------------------------------------
// How I build with AI. The loop between implementation and review is the
// point -- most tasks pass through it more than once before a PR opens. On
// desktop it runs left to right with the loop dashed underneath; on mobile
// it runs top to bottom with the loop out the right side.
// ---------------------------------------------------------------------------

const aiSteps = [
  { id: 'brainstorm', label: 'Brainstorm & Scope', icon: Idea01Icon, accent: 'purple' as const },
  { id: 'plan', label: 'Spec & Plan', icon: File01Icon, accent: 'cyan' as const },
  { id: 'implement', label: 'Subagent Implementation', icon: AiBrain02Icon, accent: 'pink' as const },
  { id: 'review', label: 'Task Review', icon: Search01Icon, accent: 'cyan' as const },
  { id: 'pr', label: 'Pull Request', icon: GitPullRequestIcon, accent: 'purple' as const },
  { id: 'deploy', label: 'Merge & Deploy', icon: Rocket01Icon, accent: 'pink' as const },
]
const AI_W = 144

function aiChain(direction: 'row' | 'column'): Edge[] {
  const [from, to] = direction === 'row' ? ['out-right', 'in-left'] : ['out-bottom', 'in-top']
  return aiSteps.slice(1).map((step, index) => edge(`${aiSteps[index].id}-${step.id}`, aiSteps[index].id, step.id, { from, to }))
}

export const aiWorkflowLayouts: { desktop: StackLayout; mobile: StackLayout } = {
  desktop: {
    nodes: aiSteps.map((step, index) => node(step.id, index * (AI_W + 40), 0, step, { width: AI_W })),
    edges: [
      ...aiChain('row'),
      edge('review-implement', 'review', 'implement', {
        from: 'out-bottom',
        to: 'in-bottom',
        accent: 'pink',
        dashed: true,
        offset: 28,
        label: 'changes requested',
      }),
    ],
    margin: { x: 0, y: 56 },
  },
  mobile: {
    nodes: aiSteps.map((step, index) => node(step.id, 0, index * 144, step)),
    edges: [
      ...aiChain('column'),
      edge('review-implement', 'review', 'implement', {
        from: 'out-right',
        to: 'in-right',
        accent: 'pink',
        dashed: true,
        offset: 28,
      }),
    ],
    margin: { x: 40, y: 0 },
  },
}
