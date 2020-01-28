require('dotenv').config();
const { RTMClient, WebClient } = require('@slack/client');

const token = process.env.XOXB;
if (!token) {
  console.log('You must specify a token to use this example');
  return;
}
const web = new WebClient(token);
const conversationID = 'CRMG7KBF1';
// 'CSCE1HD9T'; // ID for test channel on TWD
// 'CRMG7KBF1'; ID for AC Events channel

function slackSend(weeklyOrDaily, events) {
  console.log(events);
  // weeklyOrDaily is whether sending a weekly message or a daily message
  // weekly = 0
  // daily = 1
  if (weeklyOrDaily === 0) {
    const wd = 'this week.';
    let slackMessage = `There are ${events.length} events ${wd}\n`;
    events.forEach(event => {
      slackMessage += `\n*${event.title}*\n${event.date}\n<${event.url}|Click Here for More Info!>\n `;
    });
    if (events.length !== 0) {
      web.chat
        .postMessage({ channel: conversationID, text: `${slackMessage}\n` })
        .then(res => {
          console.log('Message sent: ', res.ts);
        })
        .catch(console.error);
    }
  } else {
    const wd = 'today.\n';
    let slackMessage = `There are ${events.length} events ${wd} \n`;
    events.forEach(event => {
      slackMessage += `\n*${event.title}*\n${event.date}\n<${event.url}|Click Here for More Info!>\n `;
    });
    if (events.length !== 0) {
      web.chat
        .postMessage({ channel: conversationID, text: `${slackMessage}\n` })
        .then(res => {
          console.log('Message sent: ', res.ts);
        })
        .catch(console.error);
    }
  }
}

exports.slackSend = slackSend;
