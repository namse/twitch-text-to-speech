const AWS = require('aws-sdk');

AWS.config.region = 'ap-northeast-2';
const polly = new AWS.Polly();

async function textToSpeech(text) {
  const params = {
    OutputFormat: 'mp3',
    Text: text,
    TextType: 'text',
    VoiceId: 'Seoyeon'
  };
  const {
    AudioStream: audioStream,
  } = await polly.synthesizeSpeech(params).promise();

  return audioStream;
}

module.exports = textToSpeech;
