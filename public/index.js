const ws = new WebSocket('ws://irc-ws.chat.twitch.tv');

const nick = 'justinfan13113 '; //all lowercase
const auth = 'kappa'; //include oauth:xxxx
const channel = 'namse_';

ws.onopen = () => {
  ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
  ws.send('PASS ' + auth);
  ws.send('NICK ' + nick);
  ws.send('JOIN #' + channel);
};

const audio = new Audio();
const urlQueue = [];
let isPlaying = false;

audio.addEventListener('ended', () => {
  isPlaying = false;
  setTimeout(() => playChat(), 3000);
})

function playChat() {
  if (isPlaying) {
    return;
  }
  const url = urlQueue.shift();
  if (url) {
    audio.src = url;
    isPlaying = true;
    audio.play();
  }
}

function pushChat(name, content) {
  const rawURL = /^[\x00-\x7F]*$/.test(name) && /^[\x00-\x7F]*$/.test(content)
    ? `https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q=ddingddong. ddingddong. Chatting from ${name}. ${content}&tl=en-us`
    : `https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q=띵동. 띵동. ${name} 님의 채팅입니다. ${content}&tl=ko-kr`
  const url = encodeURI(rawURL);
  urlQueue.push(url);

  if (!isPlaying) {
    playChat();
  }
}

// reply to ping
ws.onmessage = (event) => {

  const { data } = event;
  if (data.lastIndexOf('PING', 0) === 0) {
    ws.send('PONG :tmi.twitch.tv');
    console.log('PONG Sent\r\n');
    return;
  }

  const indexOfPRIVMSG = data.indexOf('PRIVMSG');
  if (indexOfPRIVMSG >= 0) {
    const headers = data.substring(0, indexOfPRIVMSG).split(';');
    const content = data.substring(data.indexOf(':', indexOfPRIVMSG) + 1);
    const name = headers.find(header => header.indexOf('display-name') === 0)
      .substring('display-name='.length);
    pushChat(name, content);
  }
};
