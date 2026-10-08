const { execFile } = require('child_process')
const { promisify } = require('util')
const fs = require('fs/promises')
const os = require('os')
const path = require('path')
const logger = require('../utils/logger')

const execFileAsync = promisify(execFile)

const MAX_SECONDS = 8
const MAX_BYTES = 1_000_000
// se o arquivo ficar grande demais, tenta de novo com qualidade menor
const QUALITIES = [50, 35, 20]

// Converte um vídeo/GIF (buffer) em figurinha animada WebP 512x512
async function convertVideoToSticker(videoBuffer) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sticker-'))
  const input = path.join(dir, 'input.mp4')
  const output = path.join(dir, 'output.webp')

  try {
    await fs.writeFile(input, videoBuffer)

    for (const quality of QUALITIES) {
      await execFileAsync('ffmpeg', [
        '-y',
        '-loglevel', 'error',
        '-i', input,
        '-t', String(MAX_SECONDS),
        '-an',
        '-vf', 'fps=15,scale=512:512:force_original_aspect_ratio=increase,crop=512:512,format=rgba',
        '-vcodec', 'libwebp',
        '-loop', '0',
        '-q:v', String(quality),
        output
      ], { timeout: 30000 })

      const result = await fs.readFile(output)
      if (result.length <= MAX_BYTES) return result

      logger.warn({ quality, bytes: result.length }, 'Figurinha grande demais, tentando qualidade menor')
    }

    throw new Error('Figurinha animada ficou grande demais mesmo com qualidade mínima')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
}

module.exports = { convertVideoToSticker }