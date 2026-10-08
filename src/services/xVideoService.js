const { execFile } = require('child_process')
const { promisify } = require('util')
const fs = require('fs/promises')
const os = require('os')
const path = require('path')

const execFileAsync = promisify(execFile)

// Baixa o vídeo de um tweet (X) e devolve como buffer
async function downloadXVideo(url) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'xvideo-'))
  const output = path.join(dir, 'video.mp4')

  try {
    await execFileAsync('yt-dlp', [
      '--no-playlist',
      '--max-filesize', '15M',
      '-f', 'mp4/best',
      '-o', output,
      url
    ], { timeout: 60000 })

    try {
      return await fs.readFile(output)
    } catch {
      // yt-dlp não dá erro quando passa do --max-filesize, só não gera o arquivo
      throw new Error('Vídeo não baixado (grande demais ou indisponível)')
    }
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
}

module.exports = { downloadXVideo }