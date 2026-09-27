import type { Vec } from './game/types'

export type InputHandlers = {
  // True while shots and crosshair keys should work (a wave in play).
  isPlaying: () => boolean
  // True while P should pause or resume (any part of a running game).
  canPause: () => boolean
  fireAt: (point: Vec) => void
  fireAtCrosshair: () => void
  setCrosshair: (point: Vec) => void
  togglePause: () => void
  // Arrow keys currently held, read each frame to move the crosshair.
  heldKeys: Set<string>
}

const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

// Mouse/touch on the canvas and keyboard on the window. Returns a cleanup.
export function attachInput(canvas: HTMLCanvasElement, handlers: InputHandlers): () => void {
  const local = (event: PointerEvent): Vec => {
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }
  const onPointerDown = (event: PointerEvent) => {
    event.preventDefault()
    const point = local(event)
    handlers.setCrosshair(point)
    if (handlers.isPlaying()) handlers.fireAt(point)
  }
  const onPointerMove = (event: PointerEvent) => handlers.setCrosshair(local(event))

  const onKeyDown = (event: KeyboardEvent) => {
    if (ARROWS.has(event.key) && handlers.isPlaying()) {
      event.preventDefault()
      handlers.heldKeys.add(event.key)
    } else if (event.key === ' ' && handlers.isPlaying()) {
      event.preventDefault()
      if (!event.repeat) handlers.fireAtCrosshair()
    } else if ((event.key === 'p' || event.key === 'P') && handlers.canPause()) {
      handlers.togglePause()
    }
  }
  const onKeyUp = (event: KeyboardEvent) => handlers.heldKeys.delete(event.key)
  const onBlur = () => handlers.heldKeys.clear()

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
  }
}
