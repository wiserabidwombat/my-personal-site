import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import '../App.css'

const weatherCodeMap: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
}

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [weather, setWeather] = useState<{
    temperature: number
    windspeed: number
    weathercode: number
    time: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=33.0198&longitude=-96.6989&current_weather=true&timezone=America%2FChicago'
        )

        if (!response.ok) {
          throw new Error(`Weather request failed: ${response.status}`)
        }

        const data = await response.json()

        if (!data.current_weather) {
          throw new Error('Unable to load weather data.')
        }

        const celsius = data.current_weather.temperature
        setWeather({
          ...data.current_weather,
          temperature: celsius * 9 / 5 + 32,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  return (
    <>
      <header className="relative mb-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 hero-grid opacity-25" />
        <div className="relative z-10 py-20 px-6 sm:px-12 lg:px-20">
          <h1 className="text-5xl font-extrabold tracking-tight neon">Neon Portfolio</h1>
          <p className="mt-4 text-lg text-slate-200/80 max-w-2xl">
            A synthwave-styled showcase of projects, hobbies, and things I care about.
          </p>

          <div className="mt-8 flex gap-4">
            <Link to="/about" className="hero-cta inline-flex items-center rounded-full px-6 py-3 bg-gradient-to-r from-[#ff2d95] to-[#7c4dff] text-black font-semibold shadow-lg">
              About Me
            </Link>
            <a href="#" className="inline-flex items-center rounded-full px-6 py-3 border border-solid border-indigo-700 text-slate-200">
              Projects
            </a>
          </div>
        </div>
      </header>

      <section className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-10 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Plano, TX • 75002</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Weather & welcome.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Live weather for your zip code right on the homepage, with a sleek dark UI to keep your site looking professional.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-6 py-5 text-center shadow-xl shadow-slate-950/50 sm:min-w-[220px]">
          {loading ? (
            <p className="text-sm text-slate-400">Loading weather…</p>
          ) : error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : weather ? (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current</p>
              <p className="mt-3 text-5xl font-semibold text-white">{weather.temperature.toFixed(0)}°F</p>
              <p className="mt-2 text-sm text-slate-400">
                {weatherCodeMap[weather.weathercode] ?? 'Unknown'} • Wind {weather.windspeed.toFixed(0)} mph
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                Updated {new Date(weather.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">No weather data available.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <article className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-white">Why weather matters</h2>
          <p className="mt-3 text-slate-400">
            Your homepage now displays real-time weather for 75002 using Open-Meteo. It updates automatically when the page loads.
          </p>
        </article>

        <article className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-white">Professional style</h2>
          <p className="mt-3 text-slate-400">
            A dark glassmorphism panel keeps the homepage feeling modern and elegant, while the navigation stays crisp and accessible.
          </p>
        </article>
      </div>
    </section>
    </>
  )
}
