const AWS = require('aws-sdk');

AWS.config.region = 'ap-northeast-2';
const polly = new AWS.Polly();

function isEnglish(text) {
  return /^[\x00-\x7F]*$/.test(text);
}

async function textToSpeech(text) {

  const params = {
    OutputFormat: 'mp3',
    Text: text,
    TextType: 'text',
    VoiceId: isEnglish(text) ? 'Brian' : 'Seoyeon',
  };
  const {
    AudioStream: audioStream,
  } = await polly.synthesizeSpeech(params).promise();

  return audioStream;
}

module.exports = textToSpeech;
