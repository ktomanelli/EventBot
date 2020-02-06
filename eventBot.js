require('dotenv').config();
const { RTMClient, WebClient } = require('@slack/client');

const token = process.env.XOXB;
if (!token) {
  console.log('You must specify a token to use this example');
  return;
}
const web = new WebClient(token);
const conversationID = process.env.CHANNEL_ID;

function slackSend(weeklyOrDaily, events) {
  console.log(events);
  // weeklyOrDaily is whether sending a weekly message or a daily message
  // weekly = 0
  // daily = 1
  if (weeklyOrDaily === 0) {
    const wd = 'this week.';
    if (events.length !== 0) {
      web.chat
        .postMessage({
          channel: conversationID,
          text: `There are ${events.length} events ${wd}\n`,
        })
        .then(res => {
          console.log('Message sent: ', res.ts);
        })
        .catch(console.error);
    }
    setTimeout(function() {
      events.forEach(event => {
        const slackMessage = `\n*${event.title}*\n${event.date}\n<${event.url}|Click Here for More Info!>\n `;
        if (events.length !== 0) {
          web.chat
            .postMessage({ channel: conversationID, text: `${slackMessage}\n` })
            .then(res => {
              console.log('Message sent: ', res.ts);
            })
            .catch(console.error);
        }
      });
    }, 1000);
  } else {
    const wd = 'today.\n';
    let slackMessage = `There are ${events.length} events ${wd} \n`;
    if (events.length !== 0) {
      web.chat
        .postMessage({
          channel: conversationID,
          text: `There are ${events.length} events ${wd} \n`,
        })
        .then(res => {
          console.log('Message sent: ', res.ts);
        })
        .catch(console.error);
    }
    setTimeout(function() {
      events.forEach(event => {
        slackMessage = `\n*${event.title}*\n${event.date}\n<${event.url}|Click Here for More Info!>\n `;
        if (events.length !== 0) {
          web.chat
            .postMessage({ channel: conversationID, text: `${slackMessage}\n` })
            .then(res => {
              console.log('Message sent: ', res.ts);
            })
            .catch(console.error);
        }
      });
    }, 1000);
  }
}

exports.slackSend = slackSend;
