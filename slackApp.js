const axios = require('axios').default;
require('dotenv').config();

const eventBot = require('./eventBot.js');

let timeNow = new Date();
timeNow = timeNow.toISOString();
const oneWeekFromNowEpoch = new Date();
oneWeekFromNowEpoch.setDate(oneWeekFromNowEpoch.getDate() + 7);
const oneWeekFromNow = oneWeekFromNowEpoch.toISOString();

const astoriaCreatives = 'http://api.meetup.com/AstoriaCreatives/events';
const astoriaWriters = 'http://api.meetup.com/astoriawritersgroup/events';
const astoriaTech = 'http://api.meetup.com/Astoria-Tech-Meetup/events';
const queensTech = 'http://api.meetup.com/Queens-Tech-Night/events';
const designDriven = 'http://api.meetup.com/Design-Driven-NYC/events/';
const qed = `https://www.googleapis.com/calendar/v3/calendars/b9cmt5r1ikc6ho8ego41l9dl5iijj2nf@import.calendar.google.com/events?key=${process.env.GOOGLE_KEY}&timeMin=${timeNow}&timeMax=${oneWeekFromNow}`;
const typeThursdayNYC = '';
const sources = [
  astoriaCreatives,
  astoriaWriters,
  astoriaTech,
  queensTech,
  designDriven,
  qed,
];

function fixDate(dataDate) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    day: 'numeric',
    month: 'long',
  };
  const dateStr = Date.parse(dataDate);
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString('en-US', options);

  // unfinished, this would re arange date so it's easier to read
  // dataDate.sort(function(a, b) {
  //   return a - b;
  // });
}
async function getEvents(links, timeFrame) {
  try {
    const events = [];
    let response = '';
    for (let x = 0; x < links.length; x += 1) {
      response = await axios.get(links[x]);
      if (links[x] === qed) {
        for (let i = 0; i < response.data.items.length; i += 1) {
          if (
            Date.parse(response.data.items[i].start.dateTime) <
              Date.now() + timeFrame * 86400000 &&
            Date.parse(response.data.items[i].start.dateTime) > Date.now()
          ) {
            events.unshift({
              title: response.data.items[i].summary,
              date: fixDate(response.data.items[i].start.dateTime),
              url: response.data.items[i].htmlLink,
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
              title: response.data[i].name,
              date: fixDate(response.data[i].local_date),
              url: response.data[i].link,
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

setInterval(function() {
  const today = new Date();
  if (today.getDay() === 0) {
    if (today.getHours() === 10 && today.getMinutes() === 38) {
      eventData(sources, 7, 0);
      eventData(sources, 1, 1);
    }
  } else if (today.getHours() === 10 && today.getMinutes() === 38) {
    eventData(sources, 1, 1);
  }
}, 60000);
