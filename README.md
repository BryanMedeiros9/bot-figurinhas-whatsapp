# Bot de Figurinhas — WhatsApp

Bot que recebe uma imagem no WhatsApp e devolve a mesma imagem convertida em figurinha (sticker).

## Stack
- **Node.js**
- **[Baileys](https://github.com/WhiskeySockets/Baileys)** — conexão com o WhatsApp via WebSocket (sem browser/Puppeteer)
- **Sharp** — conversão de imagem para webp
- **Pino** — logs estruturados

## Requisitos do projeto
- RF01: Receber imagem estática via WhatsApp
- RF02: Converter a imagem para o formato de figurinha (webp, 512x512)
- RF03: Enviar a figurinha de volta no mesmo chat
- RF04: Uso aberto (sem whitelist), suportando uso concorrente de ~4-6 pessoas
- RF05: Logs de atividade no backend (não no WhatsApp)
- RNF01: Resposta em menos de 10 segundos
- RNF02: Disponibilidade contínua (24/7)
- RNF03: Custo de infraestrutura zero

## Como rodar
```bash
npm install
node index.js
```

Na primeira execução, um QR code vai aparecer no terminal. Escaneie com o WhatsApp que vai atuar como o bot (WhatsApp > Aparelhos conectados > Conectar um aparelho).

A sessão fica salva na pasta `auth_session/` — não é necessário escanear o QR de novo nas próximas execuções, a menos que você desconecte o aparelho.

## Estrutura
```
src/
  connection/   → conexão e ciclo de vida da sessão WhatsApp
  handlers/     → lógica de decisão ao receber uma mensagem
  services/     → conversão de imagem em figurinha
  utils/        → logger
```
