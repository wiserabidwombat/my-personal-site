// One-time Spotify authorization for the Music page. Runs the Authorization
// Code flow against a local callback server and prints a refresh token to
// the terminal, which api/spotify.ts then uses to fetch your own listening
// data. Visitors never sign in. The token is only printed -- never written to
// a file -- so copy it into .env.local and the Vercel project settings.
//
//   npm run spotify:auth
//
// Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local, and
// the redirect URI below registered on the app in the Spotify Developer
// Dashboard. Spotify doesn't allow "localhost" in redirect URIs; loopback
// apps must use the IP literal 127.0.0.1 over plain http.
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'

const HOST = '127.0.0.1'
const PORT = 8888
const REDIRECT_URI = `http://${HOST}:${PORT}/callback`
const SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
  'playlist-read-private',
  'user-library-read',
]
const TIMEOUT_MS = 5 * 60 * 1000

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET. Add both to .env.local first.')
  process.exit(1)
}

// Guards the callback against requests that didn't start from this run.
const state = randomBytes(16).toString('hex')

const authorizeUrl = new URL('https://accounts.spotify.com/authorize')
authorizeUrl.search = new URLSearchParams({
  client_id: SPOTIFY_CLIENT_ID,
  response_type: 'code',
  redirect_uri: REDIRECT_URI,
  scope: SCOPES.join(' '),
  state,
  // Always show the consent screen, so a re-run can't silently reuse an
  // earlier grant with different scopes.
  show_dialog: 'true',
}).toString()

async function exchangeCode(code) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.refresh_token) {
    throw new Error(`Token exchange failed (${response.status}): ${body.error_description ?? body.error ?? 'no refresh token returned'}`)
  }
  return body
}

function page(message) {
  return `<!doctype html><meta charset="utf-8"><title>Spotify auth</title><body style="font-family:system-ui;padding:2rem">${message}</body>`
}

function openInBrowser(url) {
  const [command, args] =
    process.platform === 'win32'
      ? ['rundll32', ['url.dll,FileProtocolHandler', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]]
  try {
    spawn(command, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref()
  } catch {
    // Opening the browser is a convenience; the URL is printed either way.
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', REDIRECT_URI)
  if (url.pathname !== '/callback') {
    response.writeHead(404).end()
    return
  }

  const finish = (status, message, exitCode) => {
    response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' }).end(page(message))
    server.close()
    clearTimeout(timeout)
    process.exitCode = exitCode
  }

  if (url.searchParams.get('state') !== state) {
    finish(400, 'State mismatch. Close this tab and run the script again.', 1)
    console.error('State mismatch -- ignoring this callback. Run the script again.')
    return
  }
  const error = url.searchParams.get('error')
  if (error) {
    finish(400, `Spotify returned an error: ${error}. You can close this tab.`, 1)
    console.error(`Authorization was not granted: ${error}`)
    return
  }

  try {
    const tokens = await exchangeCode(url.searchParams.get('code') ?? '')
    finish(200, 'Done. Return to the terminal for your refresh token, then close this tab.', 0)
    console.log('\nAuthorized scopes:', tokens.scope)
    console.log('\nSPOTIFY_REFRESH_TOKEN (copy into .env.local and Vercel; it is not saved anywhere):\n')
    console.log(tokens.refresh_token)
    console.log()
  } catch (exchangeError) {
    finish(500, 'Token exchange failed. See the terminal for details.', 1)
    console.error(exchangeError.message)
  }
})

const timeout = setTimeout(() => {
  console.error('Timed out after 5 minutes waiting for the Spotify callback.')
  server.close()
  process.exitCode = 1
}, TIMEOUT_MS)

server.on('error', (error) => {
  console.error(
    error.code === 'EADDRINUSE' ? `Port ${PORT} is in use. Free it and run the script again.` : error.message,
  )
  process.exit(1)
})

server.listen(PORT, HOST, () => {
  console.log(`Waiting for Spotify on ${REDIRECT_URI}`)
  console.log('\nOpen this URL to authorize (trying to open your browser now):\n')
  console.log(authorizeUrl.toString())
  console.log()
  openInBrowser(authorizeUrl.toString())
})
