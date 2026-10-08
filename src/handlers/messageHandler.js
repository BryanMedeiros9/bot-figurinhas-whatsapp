const { downloadMediaMessage } = require('baileys')
const { convertImageToSticker } = require('../services/stickerService')
const { convertVideoToSticker } = require('../services/animatedStickerService')
const { downloadXVideo } = require('../services/xVideoService')
const logger = require('../utils/logger')

const X_LINK_REGEX = /https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/\w+\/status\/\d+/i

// RF01: identifica se a mensagem recebida contém uma imagem estática
function extractImageMessage(msg) {
  return msg.message?.imageMessage || null
}

// identifica vídeo ou GIF (o WhatsApp manda GIF como videoMessage)
function extractVideoMessage(msg) {
  return msg.message?.videoMessage || null
}

function extractText(msg) {
  return msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
}

async function handleImage(sock, msg, from) {
  logger.info({ from }, 'Imagem recebida, iniciando conversão')
  const startedAt = Date.now()

  const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger })
  const stickerBuffer = await convertImageToSticker(buffer)
  await sock.sendMessage(from, { sticker: stickerBuffer })

  logger.info({ from, elapsedMs: Date.now() - startedAt }, 'Figurinha enviada com sucesso')
}

async function handleVideo(sock, msg, from) {
  logger.info({ from }, 'Vídeo/GIF recebido, iniciando conversão')
  const startedAt = Date.now()

  const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger })
  const stickerBuffer = await convertVideoToSticker(buffer)
  await sock.sendMessage(from, { sticker: stickerBuffer })

  logger.info({ from, elapsedMs: Date.now() - startedAt }, 'Figurinha animada enviada com sucesso')
}

async function handleXLink(sock, msg, from, url) {
  logger.info({ from, url }, 'Link do X recebido, baixando vídeo')
  const startedAt = Date.now()

  // feedback rápido, porque o download pode passar dos 10s
  await sock.sendMessage(from, { text: 'Baixando o vídeo... ⏳' }, { quoted: msg })

  try {
    const videoBuffer = await downloadXVideo(url)
    await sock.sendMessage(from, { video: videoBuffer, mimetype: 'video/mp4' }, { quoted: msg })
    logger.info({ from, elapsedMs: Date.now() - startedAt }, 'Vídeo do X enviado com sucesso')
  } catch (err) {
    logger.error({ from, url, err }, 'Falha ao baixar vídeo do X')
    await sock.sendMessage(
      from,
      { text: 'Não consegui baixar. O tweet tem vídeo? Ele pode ser grande demais também.' },
      { quoted: msg }
    )
  }
}

// Processa uma única mensagem recebida. Recebe o socket (pra poder responder)
// e a mensagem crua vinda do evento 'messages.upsert' do Baileys.
async function handleIncomingMessage(sock, msg) {
  // ignora mensagens enviadas pelo próprio bot e mensagens sem conteúdo
  if (!msg.message || msg.key.fromMe) return

  const from = msg.key.remoteJid

  try {
    if (extractImageMessage(msg)) return await handleImage(sock, msg, from)
    if (extractVideoMessage(msg)) return await handleVideo(sock, msg, from)

    const xLink = extractText(msg).match(X_LINK_REGEX)
    if (xLink) return await handleXLink(sock, msg, from, xLink[0])
  } catch (err) {
    logger.error({ from, err }, 'Falha ao processar mensagem')
  }
}

module.exports = { handleIncomingMessage }