import { ReactFlow, Position, Handle, type Node, type Edge, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { HugeiconsIcon } from '@hugeicons/react'
import { accentStyles, type StackNodeData } from './stackFlowTheme'

const hiddenHandle = '!size-1 !min-w-0 !min-h-0 !border-0 !bg-transparent'

// Extra source handles spread along the bottom and right edges, so several
// arrows leaving one box each start from their own point instead of sharing
// a trunk. Ids are `out-bottom-<percent>` / `out-right-<percent>`.
const BOTTOM_FAN = [
  { id: 'out-bottom-20', className: '!left-[20%]' },
  { id: 'out-bottom-30', className: '!left-[30%]' },
  { id: 'out-bottom-40', className: '!left-[40%]' },
  { id: 'out-bottom-60', className: '!left-[60%]' },
  { id: 'out-bottom-70', className: '!left-[70%]' },
  { id: 'out-bottom-80', className: '!left-[80%]' },
]
const RIGHT_FAN = [
  { id: 'out-right-30', className: '!top-[30%]' },
  { id: 'out-right-70', className: '!top-[70%]' },
]

// One box per node, with the site's restrained card border. Every side has
// a target (`in-*`) and a source (`out-*`) handle, so a diagram can route
// arrows in any direction -- left to right on desktop, top to bottom on
// mobile, and a review loop out the side or bottom.
function StackNode({ data }: NodeProps<Node<StackNodeData>>) {
  const accent = accentStyles[data.accent]
  return (
    <>
      <Handle type="target" position={Position.Top} id="in-top" className={hiddenHandle} />
      <Handle type="target" position={Position.Left} id="in-left" className={hiddenHandle} />
      <Handle type="target" position={Position.Right} id="in-right" className={hiddenHandle} />
      <Handle type="target" position={Position.Bottom} id="in-bottom" className={hiddenHandle} />
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)] px-3 py-2 text-center">
        <HugeiconsIcon icon={data.icon} strokeWidth={2} className={`size-5 flex-none ${accent.icon}`} aria-hidden="true" />
        <p className="text-sm leading-tight font-semibold text-slate-100">{data.label}</p>
        {data.steps && (
          <ol className="mt-1 w-full space-y-0.5 text-left text-xs text-slate-300">
            {data.steps.map((step, index) => (
              <li key={step} className="flex gap-1.5">
                <span className={`flex-none font-semibold tabular-nums ${accent.icon}`}>{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="out-bottom" className={hiddenHandle} />
      <Handle type="source" position={Position.Right} id="out-right" className={hiddenHandle} />
      <Handle type="source" position={Position.Top} id="out-top" className={hiddenHandle} />
      <Handle type="source" position={Position.Left} id="out-left" className={hiddenHandle} />
      {BOTTOM_FAN.map((handle) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Bottom}
          id={handle.id}
          className={`${hiddenHandle} ${handle.className}`}
        />
      ))}
      {RIGHT_FAN.map((handle) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={handle.id}
          className={`${hiddenHandle} ${handle.className}`}
        />
      ))}
    </>
  )
}

const nodeTypes = { stackNode: StackNode }

// fitView's zoom floor. A layout wider than the container can show at this
// zoom gets a wider, horizontally scrollable container instead of being
// clipped (the pane is overflow: hidden and panning is off).
const MIN_ZOOM = 0.5
// Never enlarge a diagram past its natural size.
const MAX_ZOOM = 1
const FIT_PADDING = 0.04

export type StackLayout = {
  nodes: Node<StackNodeData>[]
  edges: Edge[]
  // Space beyond the boxes for arrows and labels that route outside them
  // (a review loop, an edge label), so they aren't cut off.
  margin?: { x: number; y: number }
}

type StackFlowDiagramProps = {
  layout: StackLayout
  ariaLabel: string
}

function bounds({ nodes, margin = { x: 0, y: 0 } }: StackLayout) {
  const right = Math.max(...nodes.map((node) => node.position.x + (node.width ?? 0)))
  const bottom = Math.max(...nodes.map((node) => node.position.y + (node.height ?? 0)))
  const left = Math.min(...nodes.map((node) => node.position.x))
  const top = Math.min(...nodes.map((node) => node.position.y))
  return { width: right - left + margin.x * 2, height: bottom - top + margin.y * 2 }
}

// Static picture, not an editor: dragging, connecting, selecting, and
// panning are all off. The container takes the layout's aspect ratio and is
// never wider than the layout's natural size, so fitView fills it without
// stretching boxes or leaving empty bands above and below.
export function StackFlowDiagram({ layout, ariaLabel }: StackFlowDiagramProps) {
  const { width, height } = bounds(layout)
  const padded = { width: width * (1 + FIT_PADDING * 2), height: height * (1 + FIT_PADDING * 2) }
  const minWidth = Math.ceil(padded.width * MIN_ZOOM)

  return (
    <div
      className="mx-auto"
      style={{
        aspectRatio: `${padded.width} / ${padded.height}`,
        width: `max(${minWidth}px, min(100%, ${Math.ceil(padded.width)}px))`,
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <ReactFlow
        nodes={layout.nodes}
        edges={layout.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: FIT_PADDING, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM }}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
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
