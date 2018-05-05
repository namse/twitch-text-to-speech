const express = require('express');
const bodyParser = require('body-parser')
const YouTube = require('./youtube-live-chat');
const WebSocket = require('ws');
const textToSpeech = require('./textToSpeech');
const apiKey = require('./key.js');

const app = express();

app.use(express.static('public'));

// /texttospeech?text={TEXT}
app.get('/texttospeech', async (req, res) => {
  try {
    const { text } = req.query;
    const audioStream = await textToSpeech(text);
    res.send(audioStream);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

const channelId = 'UCLQyQrwUpXasp7ejfQsjS0g';
const yt = new YouTube(channelId, apiKey);

yt.on('messages', items => {
  console.log(items.length);
  console.log(sockets.length);
  sockets.forEach(socket => socket.send(JSON.stringify(items)));
});

yt.listen();

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

const wss = new WebSocket.Server({ port: 8080 });

let sockets = [];
wss.on('connection', (ws) => {
  sockets.push(ws);
  console.log('connected', sockets.length);

  ws.on('close', () => {
    sockets = sockets.filter(socket => socket !== ws);
    console.log('disconnected');
  });
});
