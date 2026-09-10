const pino = require('pino')

// Logger único do projeto. Nível padrão 'info' — troque pra 'debug' se precisar
// investigar algo mais a fundo (ex: payloads do Baileys).
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:HH:MM:ss',
      ignore: 'pid,hostname'
    }
  }
})

module.exports = logger
