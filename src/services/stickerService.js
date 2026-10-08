const sharp = require('sharp')
const logger = require('../utils/logger')


async function convertImageToSticker(imageBuffer) {
  const startedAt = Date.now()

  const stickerBuffer = await sharp(imageBuffer)
    .resize(512, 512, {
      fit: 'cover',
      position: 'centre'
    })
    .webp({ quality: 80 })
    .toBuffer()

  const elapsedMs = Date.now() - startedAt
  logger.info({ elapsedMs }, 'Imagem convertida para figurinha')

  return stickerBuffer
}

module.exports = { convertImageToSticker }
