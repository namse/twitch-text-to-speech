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
const chatQueue = [];
let isPlaying = false;
const textDiv = document.getElementById('text');

audio.addEventListener('ended', () => {
  setTimeout(() => {
    textDiv.innerHTML = '';
    isPlaying = false;
    setTimeout(() => playChat(), 2000);
  }, 2000);
})

function isEnglish(text) {
  return /^[\x00-\x7F]*$/.test(text);
}

function playChat() {
  if (isPlaying) {
    return;
  }
  const chat = chatQueue.shift();
  if (chat) {
    const {
      name,
      content
    } = chat;
    const text = `채팅. ${name} 님.\n${content}`
    const encodedText = encodeURIComponent(text);
    console.log(encodedText);
    const url = `/texttospeech?text=${encodedText}`
    console.log(url);
    audio.src = url;
    isPlaying = true;
    audio.play();

    textDiv.innerHTML = text.replace('\n', '<br>');
  }
}

function pushChat(name, content) {
  if (name === 'Nightbot') {
    return;
  }
  if (content.indexOf('!sr') === 0) {
    return;
  }
  chatQueue.push({
    name,
    content,
  });

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
