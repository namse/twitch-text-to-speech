const textToSpeech = require('./textToSpeech');
const fs = require('fs');
const path = require('path');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

class AudioUnit {
  constructor(content, type, signature) {
    this.content = content;
    this.type = type;
    this.signature = signature;
  }
  setContent(content) {
    this.content = content;
  }
  async convertToAudioBuffer() {
    const { content, signature, type } = this;

    switch (type) {
      case AudioUnit.ContentType.TEXT: {
        const audioStream = await textToSpeech(content);
        const audioBuffer = await audioContext.decodeAudioData(audioStream.buffer);
        return audioBuffer;
      }
      case AudioUnit.ContentType.SIGNATURE: {
        let fileName = signature.audio;

        if (signature.maxCount) {
          const index = Math.floor(Math.random() * signature.maxCount);
          const extensionIndex = fileName.lastIndexOf('.');
          fileName = `${fileName.substring(0, extensionIndex)}${index === 0 ? '' : index}${fileName.substring(extensionIndex)}`;
        }

        const audioStream = fs.readFileSync(path.join(__dirname, `sounds/${fileName}`));
        const audioBuffer = await audioContext.decodeAudioData(audioStream.buffer);

        return audioBuffer;
      }
    }
  }
}

AudioUnit.ContentType = {
  TEXT: 'TEXT',
  SIGNATURE: 'SIGNATURE',
};

module.exports = AudioUnit;
