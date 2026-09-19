import { ReactFlow, Position, MarkerType, Handle, type Node, type Edge, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  BrowserIcon,
  Atom01Icon,
  TriangleIcon,
  Notion01Icon,
  DatabaseLightningIcon,
  Book01Icon,
  Image01Icon,
  ImageCropIcon,
} from '@hugeicons/core-free-icons'
import { Card, CardHeader, CardTitle } from '../../@/components/ui/card'

type Glow = 'pink' | 'cyan' | 'purple'

const glowStyles: Record<Glow, { ring: string; shadow: string; icon: string }> = {
  pink: { ring: 'ring-[var(--neon-pink)]/60', shadow: 'shadow-glow-pink', icon: 'text-[var(--neon-pink)]' },
  cyan: { ring: 'ring-[var(--laser-cyan)]/60', shadow: 'shadow-glow-cyan', icon: 'text-[var(--laser-cyan)]' },
  purple: { ring: 'ring-[var(--cyber-purple)]/60', shadow: 'shadow-glow-purple', icon: 'text-[var(--cyber-purple)]' },
}

type StackNodeData = {
  label: string
  icon: typeof BrowserIcon
  glow: Glow
}

// A real React component per node -- unlike Mermaid's text-based nodes,
// this can reuse the exact same Card + glow-token styling used everywhere
// else on the site, so the diagram never drifts from the actual palette.
function StackNode({ data }: NodeProps<Node<StackNodeData>>) {
  const style = glowStyles[data.glow]
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
      <Card className={`w-44 gap-1 p-3 text-center ${style.ring} ${style.shadow} bg-[var(--deep-space-purple)]/70 backdrop-blur-md`}>
        <CardHeader className="items-center gap-1.5 p-0">
          <HugeiconsIcon icon={data.icon} strokeWidth={2} className={`size-6 ${style.icon}`} aria-hidden="true" />
          <CardTitle className="text-sm font-semibold text-slate-100">{data.label}</CardTitle>
        </CardHeader>
      </Card>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
    </>
  )
}

const nodeTypes = { stackNode: StackNode }

// Real architecture, not a chain forced flat to satisfy an auto-layout
// algorithm: Vercel's serverless API routes branch out to three independent
// data sources, and only the fossils/minerals path touches image storage.
// React Flow's explicit x/y positions make this actual shape drawable,
// which Mermaid's dagre-based layout couldn't do without spreading nodes
// in ways that fought the page's narrow, single-column layout.
const nodes: Node<StackNodeData>[] = [
  { id: 'browser', type: 'stackNode', position: { x: 300, y: 0 }, data: { label: 'Browser', icon: BrowserIcon, glow: 'pink' } },
  { id: 'app', type: 'stackNode', position: { x: 300, y: 110 }, data: { label: 'React + TanStack Router', icon: Atom01Icon, glow: 'cyan' } },
  { id: 'vercel', type: 'stackNode', position: { x: 300, y: 220 }, data: { label: 'Vercel (API Routes)', icon: TriangleIcon, glow: 'pink' } },
  { id: 'notion', type: 'stackNode', position: { x: 40, y: 350 }, data: { label: 'Notion', icon: Notion01Icon, glow: 'purple' } },
  { id: 'neon', type: 'stackNode', position: { x: 300, y: 350 }, data: { label: 'Neon Postgres', icon: DatabaseLightningIcon, glow: 'cyan' } },
  { id: 'hardcover', type: 'stackNode', position: { x: 560, y: 350 }, data: { label: 'Hardcover', icon: Book01Icon, glow: 'purple' } },
  { id: 'blob', type: 'stackNode', position: { x: 300, y: 460 }, data: { label: 'Vercel Blob', icon: Image01Icon, glow: 'cyan' } },
  { id: 'wsrv', type: 'stackNode', position: { x: 300, y: 570 }, data: { label: 'wsrv.nl (resize)', icon: ImageCropIcon, glow: 'pink' } },
]

const edgeDefaults = {
  type: 'smoothstep' as const,
  style: { stroke: 'var(--laser-cyan)', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--laser-cyan)' },
}

const edges: Edge[] = [
  { id: 'browser-app', source: 'browser', target: 'app', ...edgeDefaults },
  { id: 'app-vercel', source: 'app', target: 'vercel', ...edgeDefaults },
  { id: 'vercel-notion', source: 'vercel', target: 'notion', ...edgeDefaults },
  { id: 'vercel-neon', source: 'vercel', target: 'neon', ...edgeDefaults },
  { id: 'vercel-hardcover', source: 'vercel', target: 'hardcover', ...edgeDefaults },
  { id: 'neon-blob', source: 'neon', target: 'blob', ...edgeDefaults },
  { id: 'blob-wsrv', source: 'blob', target: 'wsrv', ...edgeDefaults },
]

// Static picture, not an editor: dragging/connecting/selecting are all off,
// matching how the Mermaid diagram it replaces behaved. fitView frames the
// whole graph on mount so it never needs an initial pan to be readable.
export function StackFlowDiagram() {
  return (
    <div className="h-[650px] w-full" role="img" aria-label="Site architecture and data flow diagram">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      />
    </div>
  )
}
