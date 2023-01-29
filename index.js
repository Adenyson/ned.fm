require('dotenv').config();
const Discord = require('discord.js');
const LastFM = require('last-fm');
const lastfm = new LastFM(process.env.LASTFM_API_KEY, process.env.LASTFM_API_SECRET);

const client = new Discord.Client();
let userRegistry = new Map();

client.on('message', async message => {
    if (!message.content.startsWith('!!')) return;
    const args = message.content.slice('!!'.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'register') {
        let username = args[0];
        lastfm.getSessionKey({username, password}, (err, session) => {
            if (err) {
                message.reply(`Erro: ${err}`);
            } else {
                userRegistry.set(message.author.id, session);
                message.reply(`Usuário ${username} registrado com sucesso.`);
            }
        });
    } else if (command === 'nowplaying') {
        let session = userRegistry.get(message.author.id);
        if (!session) {
            message.reply("Você precisa se registrar antes de usar este comando.");
            return;
        }
        lastfm.nowPlaying({sk: session}, (err, nowPlaying) => {
            if (err) {
                message.reply(`Erro: ${err}`);
            } else {
                message.reply(`Música atual: ${nowPlaying.artist['#text']} - ${nowPlaying.name}`);
            }
        });
    } else if (command === 'play') {
        let session = userRegistry.get(message.author.id);
        if (!session) {
            message.reply("Você precisa se registrar antes de usar este comando.");
            return;
            }
            let track = args.join(" ");
            lastfm.playTrack({sk: session, track}, (err) => {
            if (err) {
            message.reply(`Erro: ${err}`);
            } else {
            message.reply(`Música "${track}" tocada com sucesso.`);
            }
            });
            } else if (command === 'toptracks') {
            let username = args[0];
            lastfm.getTopTracks({username}, (err, topTracks) => {
            if (err) {
            message.reply(`Erro: ${err}`);
            } else {
            let tracks = topTracks.track.slice(0, 5);
            let reply = "As 5 músicas mais tocadas do usuário " + username + " são:\n";
            tracks.forEach((track, index) => {
            reply += `${index + 1}. ${track.name} - ${track.artist.name}\n `;
            });
            message.reply(reply);
            }
            });
            }
            });
            
            client.login('SEU_TOKEN_DISCORD');
