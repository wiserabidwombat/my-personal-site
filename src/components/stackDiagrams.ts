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
  data: { label: string; icon: IconSvgElement; accent: Accent; steps?: string[]; compact?: boolean },
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

// Mobile: a tree. The app chain sits on top; the four sources stack in one
// column below, each fed by a short connector off a single line that runs
// down the left edge. BoardGameGeek (under Notion) and Neon's image chain
// (under Neon) are compact sub-rows beneath their parent.
const MW = 208 // mobile box width
const MH = 64 // mobile box height
const SUB = { width: 168, height: 56 } // sub-row box
const SRC_X = 44 // sources sit right of the connector line
const srcCenter = SRC_X + MW / 2
const subX = srcCenter - SUB.width / 2
const mobileSize = { width: MW, height: MH }
const compact = <T extends object>(data: T) => ({ ...data, compact: true })

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
      node('browser', 0, 0, dataNodes.browser, mobileSize),
      node('app', 0, 104, dataNodes.app, mobileSize),
      node('vercel', 0, 208, dataNodes.vercel, mobileSize),
      node('notion', SRC_X, 312, dataNodes.notion, mobileSize),
      node('bgg', subX, 420, compact(dataNodes.bgg), SUB),
      node('hardcover', SRC_X, 516, dataNodes.hardcover, mobileSize),
      node('spotify', SRC_X, 620, dataNodes.spotify, mobileSize),
      node('neon', SRC_X, 724, dataNodes.neon, mobileSize),
      node('blob', subX, 828, compact(dataNodes.blob), SUB),
      node('wsrv', subX, 924, compact(dataNodes.wsrv), SUB),
    ],
    edges: [
      ...sharedDataEdges,
      ...(['notion', 'hardcover', 'spotify', 'neon'] as const).map((source) =>
        edge(`vercel-${source}`, 'vercel', source, { from: 'out-bottom-10', to: 'in-left', offset: 0 }),
      ),
      syncEdge('out-top', 'in-bottom'),
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
// Mobile: narrower build box and half-width end boxes, so Preview and
// Production fit side by side at phone width.
const MOBILE_BUILD = { width: 264, height: 176 }
const MOBILE_END = { width: 126, height: 64 }

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
      node('local', (MOBILE_BUILD.width - MW) / 2, 0, localData, mobileSize),
      node('github', (MOBILE_BUILD.width - MW) / 2, 104, githubData, mobileSize),
      node('build', 0, 208, buildData, MOBILE_BUILD),
      // Side by side under the build box, each outside its branch line (30%
      // and 70% across the box) so the two branches turn away from each other.
      node('preview', 0, 208 + MOBILE_BUILD.height + 44, compact(previewData), MOBILE_END),
      node('production', MOBILE_BUILD.width - MOBILE_END.width, 208 + MOBILE_BUILD.height + 44, compact(productionData), MOBILE_END),
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
