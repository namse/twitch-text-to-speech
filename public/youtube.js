const pushChat = require('./pushChat');
const { wait } = require('./wait');

const API_KEY = 'AIzaSyDRsN_9nC8Hh8HQYJamfP712qttIIp3qLw'; // I know it has security problem. but I already whitelist IP.

class YouTubeConnector {
  constructor() {
    this.channelId = 'UCLQyQrwUpXasp7ejfQsjS0g';
    this.startPolling();
  }

  async updateLiveId() {
    const url = 'https://www.googleapis.com/youtube/v3/search' +
      '?eventType=live' +
      '&part=id' +
      `&channelId=${this.channelId}` +
      '&type=video' +
      `&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const liveId = data.items[0].id.videoId;
    this.liveId = liveId;
  }

  async updateChatId() {
    if (!this.liveId) {
      await this.updateLiveId();
    }
    const url = 'https://www.googleapis.com/youtube/v3/videos' +
      '?part=liveStreamingDetails' +
      `&id=${this.liveId}` +
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
    const lastLiveId = localStorage.getItem('lastLiveId');
    const lastChatId = localStorage.getItem('lastChatId');
    const lastPageToken = localStorage.getItem('lastPageToken');

    await this.updateLiveId();
    await this.updateChatId();
    const { liveId, chatId } = this;

    if (lastLiveId === liveId && lastChatId === chatId) {
      return this.poll(lastPageToken);
    }

    localStorage.setItem('lastLiveId', liveId);
    localStorage.setItem('lastChatId', chatId);

    return this.poll();
  }

  async poll(pageToken) {
    const messageList = await this.getMessageList(pageToken);
    const { pollingIntervalMillis, nextPageToken } = messageList;

    messageList.items.forEach((item) => {
      pushChat(item.authorDetails.displayName, item.snippet.displayMessage);
    });

    localStorage.setItem('lastPageToken', nextPageToken);

    this.pollingTimer = setTimeout(() => {
      this.poll(nextPageToken);
    }, pollingIntervalMillis);
  }
}

module.exports = new YouTubeConnector();
