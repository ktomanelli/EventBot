require('dotenv').config();
const { RTMClient, WebClient } = require('@slack/client');

const token = process.env.XOXB;
if (!token) {
  console.log('You must specify a token to use this example');
  return;
}

const web = new WebClient(token);

web.channels
  .list()
  .then(res => {
    console.log('Channels', res);
  })
  .catch(error => {
    console.log(error);
  });

const conversationID = 'CSCE1HD9T';
web.chat
  .postMessage({ channel: conversationID, text: 'fuck yes' })
  .then(res => {
    console.log('Message sent: ', res.ts);
  })
  .catch(console.error);
