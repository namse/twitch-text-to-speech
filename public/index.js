
const audio = new Audio();
const audioQueue = [];
const chatQueue = [];
let isPlaying = false;
const textDiv = document.getElementById('text');

audio.addEventListener('ended', () => {
  playAudio();
})

function isEnglish(text) {
  return /^[\x00-\x7F]*$/.test(text);
}

function changeContentReadable(content) {
  return content
    .replace(/\r\n/g, '')
    .replace(/ㅋ/g, '깔')
    .replace(/ㅎ/g, '호홋')
    .replace(/^\?/g, '띠오옹?')
    .replace(/ㅇㅈ/g, '인죵')
    .replace(/ㄹㅇ/g, '레알')
    .replace(/ㅅㅂ/g, '쉬벌')
    .replace(/ㄱㄱ/g, '거거')
    .replace(/ㅇㅇ/g, '응응')
    .replace(/ㅠㅠ/g, '유유')
    .replace(/ㄴㄷㅆ/g, '네다씹')
    .replace(/ㄴㄷ\^\^/g, '네다씹')
    .replace(/namse/g, '남세')
    .replace(/ㄱㄴ/g, '갔냐?')
}

function beReady() {
  setTimeout(() => {
    textDiv.innerHTML = '';
    isPlaying = false;
    setTimeout(() => playChat(), 2000);
  }, 2000);
}

function playAudio() {
  const url = audioQueue.shift();
  if (!url) {
    beReady();
    return;
  }

  audio.src = url;
  isPlaying = true;
  audio.play();
}

const ContentType = {
  TEXT: 'TEXT',
  SIGNATURE: 'SIGNATURE',
};

const signatureSounds = [
  { text: '어서일해라', audio: '어서일해라.mp3' },
  { text: '어서 일해라', audio: '어서일해라.mp3' },
  // TODO : 헛소리하지마임마 시그니처 사운드 추가하기
];

class AudioUnit {
  constructor(content, type, signature) {
    this.content = content;
    this.type = type;
    this.signature = signature;
  }
}

function splitContentByType(content) {
  if (!content.length) {
    return [];
  }

  const sign = signatureSounds.find(sign => content.indexOf(sign.text) >= 0);
  if (!sign) {
    return [new AudioUnit(content, ContentType.TEXT)];
  }

  const { text: signText } = sign;

  const index = content.indexOf(signText);

  const front = content.substring(0, index);
  const rear = content.substring(index + signText.length);

  return [
    ...(front.length ? [new AudioUnit(front, ContentType.TEXT)] : []),
    new AudioUnit(signText, ContentType.SIGNATURE, sign),
    ...splitContentByType(rear),
  ];
}

function makeUrl(audioUnit) {
  const { content, signature } = audioUnit;

  switch (audioUnit.type) {
    case ContentType.TEXT:
      return `/texttospeech?text=${encodeURIComponent(content)}`;
    case ContentType.SIGNATURE:
      return `/sounds/${encodeURIComponent(signature.audio)}`;
  }
}

function processUrls(content) {
  const changedContent = changeContentReadable(content);

  const audioUnits = splitContentByType(changedContent);

  const urls = audioUnits.map(unit => makeUrl(unit));

  return urls;
}

function playChat() {
  if (isPlaying) {
    return;
  }
  const chat = chatQueue.shift();
  if (!chat) {
    return;
  }

  const {
    content,
  } = chat;


  const urls = processUrls(content);

  audioQueue.push(...urls);
  playAudio();
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
