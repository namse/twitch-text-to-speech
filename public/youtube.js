const pushChat = require('./pushChat');

const API_KEY = 'AIzaSyDRsN_9nC8Hh8HQYJamfP712qttIIp3qLw'; // I know it has security problem. but I already whitelist IP.

class YouTubeConnector {
  constructor() {
    this.channelId = 'UCLQyQrwUpXasp7ejfQsjS0g';
    this.startPolling();
  }

  async getLiveId() {
    const url = 'https://www.googleapis.com/youtube/v3/search' +
      '?eventType=live' +
      '&part=id' +
      `&channelId=${this.channelId}` +
      '&type=video' +
      `&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const liveId = data.items[0].id.videoId;
    return liveId;
  }

  async updateChatId() {
    const liveId = await this.getLiveId();
    const url = 'https://www.googleapis.com/youtube/v3/videos' +
      '?part=liveStreamingDetails' +
      `&id=${liveId}` +
      `&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.items.length) {
      throw new Error('Can not find chat.');
    }
    const chatId = data.items[0].liveStreamingDetails.activeLiveChatId;
    this.chatId = chatId;
  }

  async getMessageList(pageToken) {
    if (!this.chatId) {
      await this.updateChatId();
    }
    const url = 'https://www.googleapis.com/youtube/v3/liveChat/messages' +
      `?liveChatId=${this.chatId}` +
      '&part=id,snippet,authorDetails' +
      '&maxResults=2000' +
      `&key=${API_KEY}` +
      `${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  async startPolling() {
    this.poll();
  }

  async poll(pageToken) {
    const messageList = await this.getMessageList(pageToken);
    const { pollingIntervalMillis } = messageList;

    messageList.items.forEach((item) => {
      pushChat(item.authorDetails.displayName, item.snippet.displayMessage);
    });

    this.pollingTimer = setTimeout(() => {
      this.poll(messageList.nextPageToken);
    }, pollingIntervalMillis);
  }
}

module.exports = new YouTubeConnector();
