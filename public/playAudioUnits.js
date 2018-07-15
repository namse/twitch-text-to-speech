const audioContext = new (window.AudioContext || window.webkitAudioContext)();

async function play(buffer) {
  const source = audioContext.createBufferSource();
  source.connect(audioContext.destination);
  source.buffer = buffer;

  return new Promise((resolve) => {
    source.onended = () => {
      resolve();
    };
    source.start(0);
  });
}

async function playAudioUnits(audioUnits) {
  console.log(audioUnits);
  // TODO : Need Optimization
  await Promise.all(audioUnits.map(async audioUnit => {
    console.log(audioUnit);
    const buffer = await audioUnit.convertToAudioBuffer();
    await play(buffer);
  }));
}

module.exports = playAudioUnits;
