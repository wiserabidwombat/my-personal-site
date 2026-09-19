import { MarkerType, type Node, type Edge } from '@xyflow/react'
import {
  BrowserIcon,
  Atom01Icon,
  TriangleIcon,
  Notion01Icon,
  DatabaseLightningIcon,
  Book01Icon,
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
import { glowStyles, type StackNodeData } from './stackFlowTheme'

function edge(
  id: string,
  source: string,
  target: string,
  opts?: { sourceHandle?: string; targetHandle?: string; glow?: keyof typeof glowStyles; dashed?: boolean },
): Edge {
  const stroke = glowStyles[opts?.glow ?? 'cyan'].stroke
  return {
    id,
    source,
    target,
    sourceHandle: opts?.sourceHandle ?? 'bottom',
    targetHandle: opts?.targetHandle ?? 'top',
    type: 'smoothstep',
    style: { stroke, strokeWidth: 2, ...(opts?.dashed ? { strokeDasharray: '6 4' } : {}) },
    markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
  }
}

// Real architecture, not a chain forced flat to satisfy an auto-layout
// algorithm: Vercel's serverless API routes branch out to three independent
// data sources, and only the fossils/minerals path touches image storage.
export const dataFlowDiagram: { nodes: Node<StackNodeData>[]; edges: Edge[] } = {
  nodes: [
    { id: 'browser', type: 'stackNode', position: { x: 300, y: 0 }, data: { label: 'Browser', icon: BrowserIcon, glow: 'pink' } },
    { id: 'app', type: 'stackNode', position: { x: 300, y: 110 }, data: { label: 'React + TanStack Router', icon: Atom01Icon, glow: 'cyan' } },
    { id: 'vercel', type: 'stackNode', position: { x: 300, y: 220 }, data: { label: 'Vercel (API Routes)', icon: TriangleIcon, glow: 'pink' } },
    { id: 'notion', type: 'stackNode', position: { x: 40, y: 350 }, data: { label: 'Notion', icon: Notion01Icon, glow: 'purple' } },
    { id: 'neon', type: 'stackNode', position: { x: 300, y: 350 }, data: { label: 'Neon Postgres', icon: DatabaseLightningIcon, glow: 'cyan' } },
    { id: 'hardcover', type: 'stackNode', position: { x: 560, y: 350 }, data: { label: 'Hardcover', icon: Book01Icon, glow: 'purple' } },
    { id: 'blob', type: 'stackNode', position: { x: 300, y: 460 }, data: { label: 'Vercel Blob', icon: Image01Icon, glow: 'cyan' } },
    { id: 'wsrv', type: 'stackNode', position: { x: 300, y: 570 }, data: { label: 'wsrv.nl (resize)', icon: ImageCropIcon, glow: 'pink' } },
  ],
  edges: [
    edge('browser-app', 'browser', 'app'),
    edge('app-vercel', 'app', 'vercel'),
    edge('vercel-notion', 'vercel', 'notion'),
    edge('vercel-neon', 'vercel', 'neon'),
    edge('vercel-hardcover', 'vercel', 'hardcover'),
    edge('neon-blob', 'neon', 'blob'),
    edge('blob-wsrv', 'blob', 'wsrv'),
  ],
}

// What actually happens between `git push` and a live URL: a Vercel build
// runs the same test/typecheck/build steps whether the target is a preview
// or production, and only the branch decides which one it lands on.
export const buildDeployDiagram: { nodes: Node<StackNodeData>[]; edges: Edge[] } = {
  nodes: [
    { id: 'local', type: 'stackNode', position: { x: 300, y: 0 }, data: { label: 'Local Changes', icon: LaptopIcon, glow: 'purple' } },
    { id: 'github', type: 'stackNode', position: { x: 300, y: 110 }, data: { label: 'GitHub (push / PR)', icon: GithubIcon, glow: 'cyan' } },
    { id: 'build', type: 'stackNode', position: { x: 300, y: 220 }, data: { label: 'Vercel Build (vitest, tsc, vite build)', icon: Settings01Icon, glow: 'pink' } },
    { id: 'preview', type: 'stackNode', position: { x: 140, y: 350 }, data: { label: 'Preview Deployment', icon: GitPullRequestIcon, glow: 'purple' } },
    { id: 'production', type: 'stackNode', position: { x: 460, y: 350 }, data: { label: 'Production (aarontilley.me)', icon: Rocket01Icon, glow: 'pink' } },
  ],
  edges: [
    edge('local-github', 'local', 'github'),
    edge('github-build', 'github', 'build'),
    edge('build-preview', 'build', 'preview', { glow: 'purple' }),
    edge('build-production', 'build', 'production', { glow: 'pink' }),
  ],
}

// The loop between implementation and review is the point -- most tasks
// pass through it more than once before a PR opens, which is exactly the
// kind of branching-then-cycling shape Mermaid's forced-linear layout
// couldn't represent on this page.
export const aiWorkflowDiagram: { nodes: Node<StackNodeData>[]; edges: Edge[] } = {
  nodes: [
    { id: 'brainstorm', type: 'stackNode', position: { x: 300, y: 0 }, data: { label: 'Brainstorm & Scope', icon: Idea01Icon, glow: 'purple' } },
    { id: 'plan', type: 'stackNode', position: { x: 300, y: 110 }, data: { label: 'Spec & Plan', icon: File01Icon, glow: 'cyan' } },
    { id: 'implement', type: 'stackNode', position: { x: 300, y: 220 }, data: { label: 'Subagent Implementation', icon: AiBrain02Icon, glow: 'pink' } },
    { id: 'review', type: 'stackNode', position: { x: 300, y: 330 }, data: { label: 'Task Review', icon: Search01Icon, glow: 'cyan' } },
    { id: 'pr', type: 'stackNode', position: { x: 300, y: 440 }, data: { label: 'Pull Request', icon: GitPullRequestIcon, glow: 'purple' } },
    { id: 'deploy', type: 'stackNode', position: { x: 300, y: 550 }, data: { label: 'Merge & Deploy', icon: Rocket01Icon, glow: 'pink' } },
  ],
  edges: [
    edge('brainstorm-plan', 'brainstorm', 'plan'),
    edge('plan-implement', 'plan', 'implement'),
    edge('implement-review', 'implement', 'review'),
    edge('review-pr', 'review', 'pr'),
    edge('pr-deploy', 'pr', 'deploy'),
    edge('review-implement', 'review', 'implement', {
      sourceHandle: 'right-source',
      targetHandle: 'right-target',
      glow: 'pink',
      dashed: true,
    }),
  ],
}
