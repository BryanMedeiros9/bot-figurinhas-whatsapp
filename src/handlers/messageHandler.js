const { downloadMediaMessage } = require('baileys')
const { convertImageToSticker } = require('../services/stickerService')
const logger = require('../utils/logger')

// RF01: identifica se a mensagem recebida contém uma imagem estática
function extractImageMessage(msg) {
  return msg.message?.imageMessage || null
}

// Processa uma única mensagem recebida. Recebe o socket (pra poder responder)
// e a mensagem crua vinda do evento 'messages.upsert' do Baileys.
async function handleIncomingMessage(sock, msg) {
  // ignora mensagens enviadas pelo próprio bot e mensagens sem conteúdo
  if (!msg.message || msg.key.fromMe) return

  const from = msg.key.remoteJid
  const imageMessage = extractImageMessage(msg)

  if (!imageMessage) {
    // Por enquanto o bot só reage a imagem (fora de escopo: texto, vídeo, etc)
    return
  }

  logger.info({ from }, 'Imagem recebida, iniciando conversão')

  try {
    const startedAt = Date.now()

    const buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      { logger }
    )

    const stickerBuffer = await convertImageToSticker(buffer)

    await sock.sendMessage(from, {
      sticker: stickerBuffer
    })

    const elapsedMs = Date.now() - startedAt
    logger.info({ from, elapsedMs }, 'Figurinha enviada com sucesso')
  } catch (err) {
    logger.error({ from, err }, 'Falha ao processar imagem em figurinha')
  }
}

module.exports = { handleIncomingMessage }
