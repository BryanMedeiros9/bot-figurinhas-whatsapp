const { startBot } = require('./src/connection/whatsapp')
const logger = require('./src/utils/logger')

startBot().catch((err) => {
  logger.error({ err }, 'Erro fatal ao iniciar o bot')
  process.exit(1)
})
