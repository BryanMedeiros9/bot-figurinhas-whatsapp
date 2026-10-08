# Bot de Figurinhas — WhatsApp

Bot de WhatsApp feito em Node.js para uso pessoal e como projeto de estudo/portfólio. Ele transforma imagens, vídeos e GIFs em figurinhas (stickers) e baixa vídeos de links do X (Twitter).

## O que ele faz

| Você manda | O bot responde com |
|---|---|
| Uma imagem | Figurinha estática |
| Um vídeo ou GIF | Figurinha animada |
| Um link de tweet (`x.com` ou `twitter.com`) com vídeo | O vídeo do tweet |

Todas as figurinhas usam o mesmo formato: 512x512, preenchendo o quadrado e cortando as pontas se necessário.

## Stack
- **Node.js**
- **[Baileys](https://github.com/WhiskeySockets/Baileys)** — conexão com o WhatsApp via WebSocket (sem browser/Puppeteer)
- **Sharp** — conversão de imagem para webp (figurinha estática)
- **[ffmpeg](https://ffmpeg.org/)** — conversão de vídeo/GIF para webp animado
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** — download de vídeos do X
- **Pino** — logs estruturados

## Requisitos do projeto
- RF01: Receber imagem estática via WhatsApp
- RF02: Converter a imagem para o formato de figurinha (webp, 512x512)
- RF03: Enviar a figurinha de volta no mesmo chat
- RF04: Receber vídeo ou GIF e converter em figurinha animada
- RF05: Receber link do X (Twitter) e enviar o vídeo do tweet no mesmo chat
- RF06: Uso aberto (sem whitelist), suportando uso concorrente de ~4-6 pessoas
- RF07: Logs de atividade no backend (não no WhatsApp)
- RNF01: Resposta em menos de 10 segundos
- RNF02: Disponibilidade contínua (24/7) — ainda em andamento: hoje o bot só funciona enquanto roda em alguma máquina
- RNF03: Custo de infraestrutura zero

## Requisitos para rodar
- Node.js instalado
- `ffmpeg` e `yt-dlp` instalados e disponíveis no terminal

No Windows, dá pra instalar os dois com o `winget`:

```powershell
winget install Gyan.FFmpeg
winget install yt-dlp.yt-dlp
```

Depois de instalar, feche e abra o terminal de novo e confira:

```powershell
ffmpeg -version
yt-dlp --version
```

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
  services/     → conversão de imagem/vídeo em figurinha e download de vídeo do X
  utils/        → logger
```

## Limites
- Figurinha animada: até 8 segundos e cerca de 1 MB. Se o vídeo for maior, o bot reduz a qualidade até caber e corta o que passar de 8 segundos.
- Vídeo do X: até 15 MB. Tweets sem vídeo ou vídeos maiores que isso recebem uma mensagem de erro. Downloads maiores podem passar dos 10 segundos.
- O `yt-dlp` pode parar de funcionar quando o X muda algo. Atualizar com `yt-dlp -U` costuma resolver.

## Avisos
- O Baileys não é a API oficial do WhatsApp. Existe risco de o número ser bloqueado, então vale usar um número que não seja o principal.
- Não suba a pasta `auth_session/` para o GitHub, porque ela contém a sessão do WhatsApp do bot.

## Próximos passos
- Baixar vídeos do TikTok sem marca d'água
- Hospedar o bot para ficar disponível todo dia, sem depender de uma máquina ligada