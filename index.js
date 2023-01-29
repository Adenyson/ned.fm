require("dotenv").config(); // Importa o módulo dotenv e carrega as variáveis de ambiente
const Discord = require("discord.js"); // Importa o módulo discord.js
const LastFM = require("last-fm"); // Importa o módulo last-fm
const lastfm = new LastFM(
  process.env.LASTFM_API_KEY,
  process.env.LASTFM_API_SECRET
); // Cria uma nova instância da API do LastFM com as chaves da API e chave secreta carregadas pelo dotenv

const client = new Discord.Client(); // Cria uma nova instância do cliente do Discord
let userRegistry = new Map(); // Cria um mapa para armazenar as chaves de sessão dos usuários

client.on("message", async (message) => {  // Evento de mensagem do Discord
  if (!message.content.startsWith("!!")) return; // Verifica se a mensagem começa com "!!"
  const args = message.content.slice("!!".length).split(/ +/); // Divide a mensagem em um array de argumentos
  const command = args.shift().toLowerCase(); // Pega o primeiro argumento e transforma em letra minúscula

  if (command === "register") {    // Se o comando digitado for "register"
    let username = args[0];
    let password = args[1];
    lastfm.getSessionKey({ username, password }, (err, session) => {  // Busca a chave de sessão do usuário no LastFM
      if (err) {
        message.reply(`Erro: ${err}`); // Caso haja erro, envia a mensagem de erro para o usuário
      } else {
        userRegistry.set(message.author.id, session); // Salva a chave de sessão do usuário no mapa
        message.reply(`Usuário ${username} registrado com sucesso.`); // Confirma o registro para o usuário
      }
    });
  } else if (command === "nowplaying") {    // Se o comando digitado for "nowplaying"
    let session = userRegistry.get(message.author.id); // Busca a chave de sessão do usuário no mapa
    if (!session) {
      message.reply("Você precisa se registrar antes de usar este comando."); // Caso o usuário não esteja registrado, envia essa mensagem
      return;
    }
    lastfm.nowPlaying({ sk: session }, (err, nowPlaying) => {   // Busca a música atual tocando no LastFM
      if (err) {
        message.reply(`Erro: ${err}`); // Caso haja erro, envia a mensagem de erro para o usuário
      } else {
        message.reply(
          `Música atual: ${nowPlaying.artist["#text"]} - ${nowPlaying.name}`
        ); // Envia a música atual para o usuário
      }
    });
  } else if (command === "play") {    // Se o comando digitado for "play"

    let session = userRegistry.get(message.author.id);
    // Busca a chave de sessão do usuário no mapa

    if (!session) {
      message.reply("Você precisa se registrar antes de usar este comando.");
      // Caso o usuário não esteja registrado, envia essa mensagem
      return;
    }

    let track = args[0];
    // Pega o primeiro argumento como nome da música

    lastfm.track.scrobble(
      { sk: session, track, timestamp: Math.floor(Date.now() / 1000) },
      (err) => {
        // "Scrobbling" da música no LastFM

        if (err) {
          message.reply(`Erro: ${err}`);
          // Caso haja erro, envia a mensagem de erro para o usuário
        } else {
          message.reply(`Música "${track}" scrobbled com sucesso.`);
          // Confirma o scrobbling para o usuário
        }
      }
    );
  } else if (command === "help") {
    // Se o comando digitado for "help"
    message.reply(`Comandos disponíveis: register, nowplaying, play e help.`);
    // Envia a lista de comandos disponíveis para o usuário
  }
});

client.login(process.env.DISCORD_TOKEN); // Faz o login do bot no Discord com o token do bot

// Este código é responsável por criar um bot para o Discord que permite aos usuários registrar suas contas do LastFM e scrobblar músicas.
// Ele usa a biblioteca 'discord.js' para se comunicar com o Discord e a biblioteca 'last-fm' para se comunicar com o LastFM.
// Ele também usa o pacote 'dotenv' para ler as chaves de API do LastFM e do Discord do arquivo '.env'
// Ele salva as chaves de sessão dos usuários em um mapa para poder usá-las posteriormente para scrobblar músicas.
// Ele também fornece comandos para registrar, verificar qual a música atual e scrobblar músicas, e um comando de ajuda.
