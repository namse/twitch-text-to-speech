
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

function changeContentReadable(content) {
  return content.replace(/ㅋ/g, '깔')
    .replace(/ㅎ/g, '호홋')
    .replace(/^\?/g, '띠오옹?');
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
    const changedContent = changeContentReadable(content);
    const text = changedContent;
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
