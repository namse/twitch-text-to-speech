const AudioUnit = require('./AudioUnit');
const playAudioUnits = require('./playAudioUnits');

const banNames = ['Nightbot', 'Twipkr'];
const chatQueue = [];
let isPlaying = false;

// TODO : use JSON file
const signatureSounds = [
  { text: '어서일해라', audio: '어서일해라.mp3' },

  { text: '도대체얼마나쳐먹는게야', audio: '도대체얼마나쳐먹는게야.mp3' },
  { text: '도얼쳐', audio: '도대체얼마나쳐먹는게야.mp3' },
  { text: '돼지같은놈', audio: '돼지같은놈.mp3' },
  { text: '돼같놈', audio: '돼지같은놈.mp3' },

  // > Thank you 음성빌런 Voice Villein
  { text: '더러워요', audio: '더러워요.mp3' },
  { text: '더러운ㅅㄲ', audio: '더러운새끼.mp3', maxCount: 2 },
  { text: '더러워', audio: '더러워.mp3' },
  { text: 'ㄷㄹㅇ', audio: '더러워.mp3' },

  { text: '변태새끼', audio: '변태새끼.mp3', maxCount: 7 },
  { text: 'ㅂㅌㅅㄲ', audio: '변태새끼.mp3', maxCount: 7 },


  { text: '않이', audio: '않이.mp3' },
  { text: '으ㅡ', audio: '으.mp3' },
  { text: '경멸', audio: '으경멸.mp3' },
  { text: '캭퉤', audio: '캭퉤.mp3', maxCount: 3 },
  { text: '남세놈아', audio: '남세놈아.mp3' },
  // < Thank you 음성빌런 Voice Villein

  { text: 'sex', audio: 'cex.mp3', maxCount: 10 },
  { text: 'cex', audio: 'cex.mp3', maxCount: 10 },
  { text: "c'ex", audio: 'cex.mp3', maxCount: 10 },
  { text: "섹스", audio: 'cex.mp3', maxCount: 10 },
  { text: "쎾쓰", audio: 'cex.mp3', maxCount: 10 },
];

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
    .replace(/ㄷㅈㄱ/g, '뒤지기')
    .replace(/:D/g, '빅스마일')
    .replace(/\^\^7/g, '충성충성7')
}

function splitContentByType(content) {
  if (!content.length) {
    return [];
  }

  const sign = signatureSounds.find(sign => content.indexOf(sign.text) >= 0);
  if (!sign) {
    return [new AudioUnit(content, AudioUnit.ContentType.TEXT)];
  }

  const { text: signText } = sign;

  const index = content.indexOf(signText);

  const front = content.substring(0, index);
  const rear = content.substring(index + signText.length);

  return [
    ...splitContentByType(front),
    new AudioUnit(signText, AudioUnit.ContentType.SIGNATURE, sign),
    ...splitContentByType(rear),
  ];
}

function convertToAudioUnits(content) {
  const audioUnits = splitContentByType(content)
    .map(unit => {
      if (unit.type !== AudioUnit.ContentType.TEXT) {
        return unit;
      }
      const readableContent = changeContentReadable(unit.content);
      unit.setContent(readableContent);
      return unit;
    });

  return audioUnits;
}

async function playChat() {
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


  const audioUnits = convertToAudioUnits(content);

  isPlaying = true;
  await playAudioUnits(audioUnits);
  isPlaying = false;
  if (chatQueue.length) {
    await playChat();
  }
}

function pushChat(name, content) {
  if (banNames.includes(name)) {
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

module.exports = pushChat;