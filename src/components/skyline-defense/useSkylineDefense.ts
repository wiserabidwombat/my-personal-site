import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createGame, fire, startGame, step } from './game/engine'
import { resizeWorld } from './game/resize'
import type { GameState, Phase, Vec } from './game/types'
import { initialUi, type GameUi } from './gameUi'
import { loadHighScore, saveHighScore } from './highScore'
import { attachInput } from './input'
import { placeCrosshair, steerCrosshair } from './crosshair'
import { cityLayerCache } from './render/city'
import { hudHeight } from './render/hud'
import { readPalette, type Season } from './render/palette'
import skylineUrl from '../../assets/dallas-skyline.webp'
import { renderGame } from './render/renderGame'
import { personalBestAfter, testWaveFromUrl } from './testRun'

const RUNNING: ReadonlySet<Phase> = new Set(['waveTitle', 'playing', 'waveBonus'])

// Runs the game on a canvas that fills `containerRef`: sizing for
// devicePixelRatio, the animation loop, input, auto-pause when the tab is
// hidden, and the high score. React state only changes on screen/pause
// changes, never per frame. `season` only changes how the game is drawn:
// the loop picks it up on the next frame, without resetting the run.
export function useSkylineDefense(
  containerRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  season: Season = 'none',
) {
  const gameRef = useRef<GameState | null>(null)
  const pausedRef = useRef(false)
  const crosshairRef = useRef<Vec | null>(null)
  const highScoreRef = useRef(0)
  const seasonRef = useRef(season)
  useEffect(() => {
    seasonRef.current = season
  }, [season])
  // Dev-only ?wave=N (see testRun.ts); the guard lets production builds
  // drop it entirely.
  const [testWave] = useState(() => (import.meta.env.DEV ? testWaveFromUrl(window.location.search) : null))
  const [ui, setUi] = useState<GameUi>(() => initialUi(loadHighScore(), testWave))

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
    // Re-read when the season changes: the CSS tokens have already switched
    // with <html data-season>.
    let palette = readPalette(canvas, seasonRef.current)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const heldKeys = new Set<string>()
    const cityLayer = cityLayerCache(skylineUrl) // the home page's dark skyline art
    // On touch screens the crosshair stays hidden until the first tap.
    const touchFirst = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const place = (point: Vec) => (gameRef.current ? placeCrosshair(point, gameRef.current) : point)

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
      // Bonus targets fly below the HUD (which the page draws).
      Object.assign(gameRef.current, { hudBottom: hudHeight(width), reducedMotion: still })
      if (crosshairRef.current) crosshairRef.current = place(crosshairRef.current)
      else if (!touchFirst) crosshairRef.current = place({ x: width / 2, y: height * 0.4 })
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    const running = () => Boolean(gameRef.current && RUNNING.has(gameRef.current.phase))
    const detachInput = attachInput(canvas, {
      isPlaying: () => gameRef.current?.phase === 'playing' && !pausedRef.current,
      canPause: running,
      fireAt: (point) => gameRef.current && fire(gameRef.current, place(point)),
      fireAtCrosshair: () => gameRef.current && crosshairRef.current && fire(gameRef.current, crosshairRef.current),
      setCrosshair: (point) => (crosshairRef.current = place(point)),
      togglePause: () => setPaused(!pausedRef.current),
      heldKeys,
    })
    const onVisibility = () => document.hidden && running() && setPaused(true)
    document.addEventListener('visibilitychange', onVisibility)

    const finish = (game: GameState) => {
      const { best, newHighScore, save } = personalBestAfter(game.score, highScoreRef.current, testWave)
      highScoreRef.current = best
      if (save) saveHighScore(best)
      const { score, wave } = game
      setUi({ screen: 'gameOver', paused: false, score, wave, highScore: best, newHighScore, testWave })
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
        crosshairRef.current = steerCrosshair(crosshairRef.current, heldKeys, game, dt)
        step(game, dt)
      }
      if (game.phase !== phase) {
        phase = game.phase
        if (phase === 'gameOver') finish(game)
      }
      if (palette.season !== seasonRef.current) palette = readPalette(canvas, seasonRef.current)
      const city = cityLayer(game, window.devicePixelRatio || 1, palette.season)
      const view = {
        palette,
        time: now / 1000,
        still,
        highScore: highScoreRef.current,
        crosshair: crosshairRef.current,
        city,
        testWave,
      }
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
  }, [containerRef, canvasRef, setPaused, testWave])

  const start = useCallback(() => {
    if (!gameRef.current) return
    startGame(gameRef.current, testWave ?? 1)
    pausedRef.current = false
    setUi((current) => ({ ...current, screen: 'playing', paused: false, newHighScore: false }))
    canvasRef.current?.focus()
  }, [canvasRef, testWave])

  const resume = useCallback(() => {
    setPaused(false)
    canvasRef.current?.focus()
  }, [canvasRef, setPaused])

  return { ui, start, resume, pause: () => setPaused(true) }
}
