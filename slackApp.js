const axios = require('axios').default;

const eventBot = require('./eventBot.js');

let timeNow = new Date();
timeNow = timeNow.toISOString();
const oneWeekFromNowEpoch = new Date();
oneWeekFromNowEpoch.setDate(oneWeekFromNowEpoch.getDate() + 7);
const oneWeekFromNow = oneWeekFromNowEpoch.toISOString();

const typeThursdayNYC = '';
const bookCulture = 'https://www.bookculture.com/event';
const sources = {
  AstoriaCreatives: [
    'http://api.meetup.com/AstoriaCreatives/events',
    'https://i.ibb.co/NVZRr3k/Astoria-Creatives.jpg',
  ],
  AstoriaWriters: [
    'http://api.meetup.com/astoriawritersgroup/events',
    'https://i.ibb.co/M8FrVh5/astoria-Writers.png',
  ],
  AstoriaTech: [
    'http://api.meetup.com/Astoria-Tech-Meetup/events',
    'https://i.ibb.co/PtkWqxt/astoria-Tech.jpg',
  ],
  QueensTech: [
    'http://api.meetup.com/Queens-Tech-Night/events',
    'https://i.ibb.co/x6jPrK5/Queens-Tech.png',
  ],
  DesignDriven: [
    'http://api.meetup.com/Design-Driven-NYC/events/',
    'https://i.ibb.co/jhBZtZB/Design-Driven.png',
  ],
  HardWired: [
    'https://api.meetup.com/Hardwired-NYC/events/',
    'https://i.ibb.co/5B7M8x3/Hard-Wired.png',
  ],
  QED: [
    `https://www.googleapis.com/calendar/v3/calendars/b9cmt5r1ikc6ho8ego41l9dl5iijj2nf@import.calendar.google.com/events?key=${process.env.GOOGLE_KEY}&timeMin=${timeNow}&timeMax=${oneWeekFromNow}`,
    'https://i.ibb.co/ctqyZWm/QED.png',
  ],
};

function fixDate(dataDate) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric',
  };
  let dateStr = dataDate;
  if (typeof dataDate !== 'number') {
    dateStr = Date.parse(dataDate);
  }
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString('en-US', options);
}
function getKeyByValue(obj, val) {
  return Object.keys(obj).find(key => obj[key][0] === val);
}
async function getEvents(links, timeFrame) {
  try {
    const urls = Object.values(links);
    const eventLinks = [];
    const imgLinks = [];
    for (let i = 0; i < urls.length; i += 1) {
      eventLinks.push(urls[i][0]);
      imgLinks.push(urls[i][1]);
    }
    const events = [];
    let response = '';
    for (let x = 0; x < eventLinks.length; x += 1) {
      const sourceCheck = getKeyByValue(links, eventLinks[x]);

      response = await axios.get(eventLinks[x]);
      if (eventLinks[x] === sources.QED[0]) {
        for (let i = 0; i < response.data.items.length; i += 1) {
          if (
            Date.parse(response.data.items[i].start.dateTime) <
              Date.now() + timeFrame * 86400000 &&
            Date.parse(response.data.items[i].start.dateTime) > Date.now()
          ) {
            events.push({
              source: sourceCheck,
              title: response.data.items[i].summary,
              date: fixDate(response.data.items[i].start.dateTime),
              url: response.data.items[i].htmlLink,
              image_url: `${links[sourceCheck][1]}`,
            });
          }
        }
      } else {
        for (let i = 0; i < response.data.length; i += 1) {
          if (
            response.data[i].time < Date.now() + timeFrame * 86400000 &&
            response.data[i].time > Date.now()
          ) {
            events.unshift({
              source: sourceCheck,
              title: response.data[i].name,
              date: fixDate(response.data[i].time),
              url: response.data[i].link,
              image_url: `${links[sourceCheck][1]}`,
            });
          }
        }
      }
    }
    return events;
  } catch (error) {
    console.error(error);
  }
}

async function eventData(links, int, wd) {
  try {
    const myData = await getEvents(links, int);
    eventBot.slackSend(wd, myData);
  } catch (error) {
    console.error(error);
  }
}

// eventData(sources, 1, 1);

setInterval(function() {
  const today = new Date();
  if (today.getDay() === 0) {
    if (today.getHours() === 10 && today.getMinutes() === 0) {
      eventData(sources, 7, 0);
      if (today.getHours() === 10 && today.getMinutes() === 1) {
        eventData(sources, 1, 1);
      }
    }
  } else if (today.getHours() === 10 && today.getMinutes() === 0) {
    eventData(sources, 1, 1);
  }
}, 60000);
