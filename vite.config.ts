import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { IncomingMessage } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const submissionCountFile = resolve(projectRoot, '.canina-submission-count.json')

function readSubmissionCount() {
  if (!existsSync(submissionCountFile)) return 0

  try {
    const stored = JSON.parse(readFileSync(submissionCountFile, 'utf8')) as {
      count?: unknown
    }
    return typeof stored.count === 'number' && Number.isFinite(stored.count)
      ? stored.count
      : 0
  } catch {
    return 0
  }
}

function writeSubmissionCount(count: number) {
  writeFileSync(
    submissionCountFile,
    `${JSON.stringify({ count }, null, 2)}\n`,
    'utf8',
  )
}

function readRequestBody(req: IncomingMessage) {
  return new Promise<string>((resolveBody, reject) => {
    let body = ''

    req.setEncoding('utf8')
    req.on('data', (chunk: string) => {
      body += chunk
    })
    req.on('end', () => resolveBody(body))
    req.on('error', reject)
  })
}

function submissionCountPlugin(): Plugin {
  return {
    name: 'canina-submission-count',
    configureServer(server) {
      server.middlewares.use('/api/submission-count', async (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ count: readSubmissionCount() }))
          return
        }

        if (req.method === 'POST') {
          const nextCount = readSubmissionCount() + 1
          writeSubmissionCount(nextCount)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ count: nextCount }))
          return
        }

        if (req.method === 'PUT') {
          try {
            const body = await readRequestBody(req)
            const data = body ? (JSON.parse(body) as { count?: unknown }) : {}
            const count =
              typeof data.count === 'number' && Number.isFinite(data.count)
                ? Math.max(0, Math.floor(data.count))
                : readSubmissionCount()

            writeSubmissionCount(count)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ count }))
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid submission count' }))
          }
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), submissionCountPlugin()],
})
