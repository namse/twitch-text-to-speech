const request = require('request')
const { EventEmitter } = require('events')

function wait(time = 5000) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
}
/**
 * The main hub for acquire live chat with the YouTube Date API.
 * @extends {EventEmitter}
 */
class YouTube extends EventEmitter {
  /**
   * @param {string} ChannelID ID of the channel to acquire with
   * @param {string} APIKey You'r API key
   */
  constructor(channelId, apiKey) {
    super()
    this.id = channelId
    this.key = apiKey
  }

  async getLive() {
    const url = 'https://www.googleapis.com/youtube/v3/search' +
      '?eventType=live' +
      '&part=id' +
      `&channelId=${this.id}` +
      '&type=video' +
      `&key=${this.key}`
    const data = await this.request(url);
    if (!data.items[0]) {
      this.emit('error', 'Can not find live.')
    }
    else {
      this.liveId = data.items[0].id.videoId
      await this.getChatId();
    }
  }

  async getChatId() {
    if (!this.liveId) return this.emit('error', 'Live id is invalid.')
    const url = 'https://www.googleapis.com/youtube/v3/videos' +
      '?part=liveStreamingDetails' +
      `&id=${this.liveId}` +
      `&key=${this.key}`
    const data = await this.request(url);
    if (!data.items.length)
      this.emit('error', 'Can not find chat.')
    else {
      this.chatId = data.items[0].liveStreamingDetails.activeLiveChatId
    }
  }

  /**
   * Gets live chat messages.
   * See {@link https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list#response|docs}
   * @return {object}
   */
  async getChat(pageToken) {
    console.log(pageToken);
    if (!this.chatId) return this.emit('error', 'Chat id is invalid.')
    const url = 'https://www.googleapis.com/youtube/v3/liveChat/messages' +
      `?liveChatId=${this.chatId}` +
      '&part=id,snippet,authorDetails' +
      `&key=${this.key}` +
      `${pageToken ? `&pageToken=${pageToken}` : ''}`
    const data = await this.request(url);
    return data;
  }

  request(url) {
    return new Promise((resolve, reject) => {
      request.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko";
      request({
        url: url,
        method: 'GET',
        json: true,
      }, (error, response, data) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          console.log(response.statusCode);
          return reject(data);
        }
        return resolve(data);
      })
    });
  }

  async listen() {
    while (true) {
      try {
        await this.getLive();
        await this.poll();
      }
      catch (err) {
        console.error(err);
        await wait(5000);
      }
    }
  }

  async poll() {
    while (true) {
      const data = await this.getChat(this.token);

      const {
        pollingIntervalMillis,
        nextPageToken,
        items,
      } = data;
      console.log(nextPageToken, pollingIntervalMillis, items.length);

      if (items.length) {
        this.emit('messages', items);
      }

      this.token = nextPageToken;
      await wait(pollingIntervalMillis);
    }
  }

  /**
   * Stops getting live chat messages at regular intervals.
   */
  stop() {
    clearInterval(this.interval)
  }
}

module.exports = YouTube
