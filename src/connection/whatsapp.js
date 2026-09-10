const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const logger = require('../utils/logger')
const { handleIncomingMessage } = require('../handlers/messageHandler')

const AUTH_FOLDER = './auth_session'

async function startBot() {
  // useMultiFileAuthState guarda a sessão em disco — assim você escaneia o
  // QR code uma vez só e não precisa repetir a cada reinício do processo.
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false // vamos exibir o QR manualmente abaixo
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      logger.info('Escaneie o QR code abaixo com o WhatsApp do bot:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      logger.warn({ statusCode, shouldReconnect }, 'Conexão encerrada')

      if (shouldReconnect) {
        startBot()
      } else {
        logger.error('Sessão deslogada. Apague a pasta auth_session e escaneie o QR novamente.')
      }
    } else if (connection === 'open') {
      logger.info('Bot conectado ao WhatsApp com sucesso ✅')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      await handleIncomingMessage(sock, msg)
    }
  })

  return sock
}

module.exports = { startBot }
