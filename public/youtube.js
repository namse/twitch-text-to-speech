const youtubeWs = new WebSocket('ws://localhost:8080');

youtubeWs.onmessage = ({ data }) => {
  const items = JSON.parse(data);
  console.log(items);

  items.forEach(item => {
    const message = item.snippet.displayMessage;
    const name = item.authorDetails.displayName;
    pushChat(name, message);
  });
};
