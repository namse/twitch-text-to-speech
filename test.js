var WebSocket = require('ws');
var ws = new WebSocket('ws://irc-ws.chat.twitch.tv');

const nick = 'justinfan13113 '; //all lowercase
const auth = 'kappa'; //include oauth:xxxx
const channel = 'namse_';

ws.on('open', function open() {
  console.log('hi');
  ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
  ws.send('PASS ' + auth);
  ws.send('NICK ' + nick);
  ws.send('JOIN #' + channel);
});

//show raw data
ws.on('message', function(data){
	console.log(data);
});

// reply to ping
ws.on('message', function(data){
	if (data.lastIndexOf('PING', 0) === 0) {
		ws.send('PONG :tmi.twitch.tv');
		console.log('PONG Sent\r\n');
	}
});

setTimeout(() => {}, 10000);
