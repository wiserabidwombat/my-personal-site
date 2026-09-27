import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createGame, fire, startGame, step } from './game/engine'
import { resizeWorld } from './game/resize'
import { TUNING } from './game/tuning'
import type { GameState, Phase, Vec } from './game/types'
import { loadHighScore, saveHighScore } from './highScore'
import { attachInput } from './input'
import { readPalette } from './render/palette'
import { renderGame } from './render/renderGame'

export type GameUi = {
  screen: 'start' | 'playing' | 'gameOver'
  paused: boolean
  score: number
  highScore: number
  newHighScore: boolean
}

const RUNNING: ReadonlySet<Phase> = new Set(['waveTitle', 'playing', 'waveBonus'])

// Runs the game on a canvas that fills `containerRef`: sizing for
// devicePixelRatio, the animation loop, input, auto-pause when the tab is
// hidden, and the high score. React state only changes on screen/pause
// changes, never per frame.
export function useSkylineDefense(
  containerRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  const gameRef = useRef<GameState | null>(null)
  const pausedRef = useRef(false)
  const crosshairRef = useRef<Vec | null>(null)
  const highScoreRef = useRef(0)
  const [ui, setUi] = useState<GameUi>(() => ({
    screen: 'start',
    paused: false,
    score: 0,
    highScore: loadHighScore(),
    newHighScore: false,
  }))

  const setPaused = useCallback((paused: boolean) => {
    pausedRef.current = paused
    setUi((current) => ({ ...current, paused }))
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!container || !canvas || !ctx) return
    highScoreRef.current = loadHighScore()
    const palette = readPalette(canvas)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const heldKeys = new Set<string>()

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      const dpr = window.devicePixelRatio || 1
      // Backing store in device pixels, drawing in CSS pixels, so it's crisp.
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0)
      if (gameRef.current) resizeWorld(gameRef.current, width, height)
      else gameRef.current = createGame(width, height)
      crosshairRef.current ??= { x: width / 2, y: height * 0.4 }
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    const running = () => Boolean(gameRef.current && RUNNING.has(gameRef.current.phase))
    const detachInput = attachInput(canvas, {
      isPlaying: () => gameRef.current?.phase === 'playing' && !pausedRef.current,
      canPause: running,
      fireAt: (point) => gameRef.current && fire(gameRef.current, point),
      fireAtCrosshair: () => gameRef.current && crosshairRef.current && fire(gameRef.current, crosshairRef.current),
      setCrosshair: (point) => (crosshairRef.current = point),
      togglePause: () => setPaused(!pausedRef.current),
      heldKeys,
    })
    const onVisibility = () => document.hidden && running() && setPaused(true)
    document.addEventListener('visibilitychange', onVisibility)

    const moveCrosshair = (game: GameState, dt: number) => {
      const crosshair = crosshairRef.current
      if (!crosshair || heldKeys.size === 0) return
      const dx = Number(heldKeys.has('ArrowRight')) - Number(heldKeys.has('ArrowLeft'))
      const dy = Number(heldKeys.has('ArrowDown')) - Number(heldKeys.has('ArrowUp'))
      crosshair.x = Math.min(Math.max(crosshair.x + dx * TUNING.crosshairSpeed * dt, 0), game.width)
      crosshair.y = Math.min(Math.max(crosshair.y + dy * TUNING.crosshairSpeed * dt, 0), game.groundY - 12)
    }

    const finish = (game: GameState) => {
      const newHighScore = game.score > highScoreRef.current
      if (newHighScore) {
        highScoreRef.current = game.score
        saveHighScore(game.score)
      }
      setUi({ screen: 'gameOver', paused: false, score: game.score, highScore: highScoreRef.current, newHighScore })
    }

    let frame = 0
    let last = performance.now()
    let phase = gameRef.current?.phase
    const tick = (now: number) => {
      const game = gameRef.current
      if (!game) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!pausedRef.current) {
        moveCrosshair(game, dt)
        step(game, dt)
      }
      if (game.phase !== phase) {
        phase = game.phase
        if (phase === 'gameOver') finish(game)
      }
      const view = { palette, time: now / 1000, still, highScore: highScoreRef.current, crosshair: crosshairRef.current }
      renderGame(ctx, game, view)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      detachInput()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [containerRef, canvasRef, setPaused])

  const start = useCallback(() => {
    if (!gameRef.current) return
    startGame(gameRef.current)
    pausedRef.current = false
    setUi((current) => ({ ...current, screen: 'playing', paused: false, newHighScore: false }))
    canvasRef.current?.focus()
  }, [canvasRef])

  const resume = useCallback(() => {
    setPaused(false)
    canvasRef.current?.focus()
  }, [canvasRef, setPaused])

  return { ui, start, resume, pause: () => setPaused(true) }
}
