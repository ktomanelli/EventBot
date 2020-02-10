require('dotenv').config();
const { RTMClient, WebClient } = require('@slack/client');

let lastEventSource = '';
const token = process.env.XOXB;
if (!token) {
  console.log('You must specify a token to use this example');
  return;
}

const web = new WebClient(token);
const conversationID = process.env.CHANNEL_ID;

function compare(a, b) {
  let comparison = 0;
  if (a.source === b.source) {
    if (new Date(a.date).getTime() > new Date(b.date).getTime()) {
      comparison = 1;
    } else if (a.date < b.date) {
      comparison = -1;
    }
  } else if (a.source > b.source) {
    comparison = 1;
  } else if (a.source < b.source) {
    comparison = -1;
  }
  return comparison;
}
async function sendWeekly(events) {
  const postContent = {
    channel: conversationID,
    // thread_ts: '',
  };
  const postPic = {
    channel: conversationID,
  };

  const sortedEvents = events.sort(compare);
  if (events.length !== 0) {
    const groupedEvents = sortedEvents.reduce((grouped, event) => {
      if (!grouped[event.source]) {
        grouped[event.source] = { image: '', events: [] };
      }
      grouped[event.source].image = event.image_url;
      grouped[event.source].events.push(event);
      return grouped;
    }, {});
    for (let i = 0; i < Object.keys(groupedEvents).length; i += 1) {
      postContent.text = '';
      postPic.attachments = `[{
        'title':'${
          groupedEvents[Object.keys(groupedEvents)[i]].events[0].source
        }',
        'image_url':'${
          groupedEvents[Object.keys(groupedEvents)[i]].events[0].image_url
        }'}]`;
      postContent.thread_ts = await web.chat
        .postMessage(postPic)
        .then(res => {
          console.log(`Message sent: `, res.ts);
          return res.ts;
        })
        .catch(console.error);
      for (
        let x = 0;
        x < groupedEvents[Object.keys(groupedEvents)[i]].events.length;
        x += 1
      ) {
        postContent.text += `\n*${
          groupedEvents[Object.keys(groupedEvents)[i]].events[x].title
        }*\n${groupedEvents[Object.keys(groupedEvents)[i]].events[x].date}\n<${
          groupedEvents[Object.keys(groupedEvents)[i]].events[x].url
        }|Click Here for More Info!>\n`;
      }
      web.chat
        .postMessage(postContent)
        .then(res => {
          console.log(`Message sent: `, res.ts);
        })
        .catch(console.error);
    }
  }
}

function slackSend(weeklyOrDaily, events) {
  // weeklyOrDaily is whether sending a weekly message or a daily message
  // weekly = 0
  // daily = 1
  let initMessage = '';
  /** ****WEEKLY***** */
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
          initMessage = res.ts;
        })
        .catch(console.error);
    }
    setTimeout(function() {
      sendWeekly(events);
    }, 500);
  } else {
    /** ***DAILY**** */
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
        slackMessage = `\n*${event.title}*\n${event.date}\n<${event.url}|Click Here for More Info!>\n`;
        if (events.length !== 0) {
          web.chat
            .postMessage({ channel: conversationID, text: `${slackMessage}\n` })
            .then(res => {
              console.log('Message sent: ', res.ts);
            })
            .catch(console.error);
        }
        lastEventSource = event.source;
      });
    }, 1000);
  }
}

exports.slackSend = slackSend;
