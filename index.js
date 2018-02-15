const express = require('express');
const bodyParser = require('body-parser')
const textToSpeech = require('./textToSpeech');

const app = express();

app.use(express.static('public'));

// /texttospeech?text={TEXT}
app.get('/texttospeech', async (req, res) => {
  try {
    const { text } = req.query;
    const audioStream = await textToSpeech(text);
    res.send(audioStream);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
