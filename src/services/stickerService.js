const sharp = require('sharp')
const logger = require('../utils/logger')

// RF02: converte um buffer de imagem (jpg/png/qualquer formato suportado
// pelo sharp) em um buffer webp compatível com figurinha de WhatsApp.
//
// Regras do WhatsApp pra figurinha estática:
// - formato webp
// - proporção 1:1 (quadrada) — por isso o 'fit: contain' com fundo transparente
// - tamanho recomendado: 512x512
async function convertImageToSticker(imageBuffer) {
  const startedAt = Date.now()

  const stickerBuffer = await sharp(imageBuffer)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 } // fundo transparente
    })
    .webp({ quality: 80 })
    .toBuffer()

  const elapsedMs = Date.now() - startedAt
  logger.info({ elapsedMs }, 'Imagem convertida para figurinha')

  return stickerBuffer
}

module.exports = { convertImageToSticker }
