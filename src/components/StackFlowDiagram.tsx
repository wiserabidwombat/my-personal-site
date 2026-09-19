import { ReactFlow, Position, Handle, type Node, type Edge, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { HugeiconsIcon } from '@hugeicons/react'
import { Card, CardHeader, CardTitle } from '../../@/components/ui/card'
import { glowStyles, type StackNodeData } from './stackFlowTheme'

// A real React component per node -- unlike Mermaid's text-based nodes,
// this can reuse the exact same Card + glow-token styling used everywhere
// else on the site, so the diagram never drifts from the actual palette.
// Four handles (rather than just top/bottom) let a diagram route an edge
// out the side -- e.g. a review-loop's "send it back" arrow -- without
// overlapping the main top-to-bottom flow.
function StackNode({ data }: NodeProps<Node<StackNodeData>>) {
  const style = glowStyles[data.glow]
  return (
    <>
      <Handle type="target" position={Position.Top} id="top" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-transparent !border-0" />
      <Card className={`w-44 gap-1 p-3 text-center ${style.ring} ${style.shadow} bg-[var(--deep-space-purple)]/70 backdrop-blur-md`}>
        <CardHeader className="items-center gap-1.5 p-0">
          <HugeiconsIcon icon={data.icon} strokeWidth={2} className={`size-6 ${style.icon}`} aria-hidden="true" />
          <CardTitle className="text-sm font-semibold text-slate-100">{data.label}</CardTitle>
        </CardHeader>
      </Card>
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-transparent !border-0" />
    </>
  )
}

const nodeTypes = { stackNode: StackNode }

type StackFlowDiagramProps = {
  nodes: Node<StackNodeData>[]
  edges: Edge[]
  height?: number
  ariaLabel: string
}

// Static picture, not an editor: dragging/connecting/selecting are all off.
// fitView frames the whole graph on mount so it never needs an initial pan
// to be readable.
export function StackFlowDiagram({ nodes, edges, height = 650, ariaLabel }: StackFlowDiagramProps) {
  return (
    <div className="w-full" style={{ height }} role="img" aria-label={ariaLabel}>
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
