require('dotenv').config();
const { RTMClient, WebClient } = require('@slack/client');

const token = process.env.XOXB;
if (!token) {
  console.log('You must specify a token to use this example');
  return;
}
const web = new WebClient(token);
const conversationID = 'CSCE1HD9T';

function slackSend(weeklyOrDaily, events) {
  // console.log(events);

  // const eventArr = Array.from(events);
  // let wd = '';
  // weeklyOrDaily is whether sending a weekly message or a daily message
  // weekly = 0
  // daily = 1
  if (weeklyOrDaily === 0) {
    const wd = 'this week.';
    let slackMessage = `There are ${events.length} events ${wd} `;
    events.forEach(event => {
      slackMessage += `${event.title}\n${event.date}\n${event.url}`;
    });
    if (events.length !== 0) {
      web.chat
        .postMessage({ channel: conversationID, text: slackMessage })
        .then(res => {
          console.log('Message sent: ', res.ts);
        })
        .catch(console.error);
    }
  } else {
    const wd = 'today';
    let slackMessage = `There are ${events.length} events ${wd} `;
    events.forEach(event => {
      slackMessage += `${event.title}\n${event.date}\n${event.url}`;
    });
    if (events.length !== 0) {
      web.chat
        .postMessage({ channel: conversationID, text: slackMessage })
        .then(res => {
          console.log('Message sent: ', res.ts);
        })
        .catch(console.error);
    }
  }
}

exports.slackSend = slackSend;
