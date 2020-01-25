const axios = require('axios').default;
const eventBot = require('./eventBot.js');

const astoriaCreatives = 'http://api.meetup.com/AstoriaCreatives/events';
const astoriaWriters = 'http://api.meetup.com/astoriawritersgroup/events';
const astoriaTech = 'http://api.meetup.com/Astoria-Tech-Meetup/events';
const queensTech = 'http://api.meetup.com/Queens-Tech-Night/events';
const designDriven = 'http://api.meetup.com/Design-Driven-NYC/events/';
const qed =
  'https://www.googleapis.com/calendar/v3/calendars/b9cmt5r1ikc6ho8ego41l9dl5iijj2nf@import.calendar.google.com/events';
const sources = [
  astoriaCreatives,
  astoriaWriters,
  astoriaTech,
  queensTech,
  designDriven,
];
async function getEvents(links, timeFrame) {
  try {
    const events = [];
    let response = '';
    for (let x = 0; x < links.length; x += 1) {
      response = await axios.get(links[x]);
      for (let i = 0; i < response.data.length; i += 1) {
        if (response.data[i].time < Date.now() + timeFrame * 86400000) {
          events.unshift({
            title: response.data[i].name,
            date: response.data[i].local_date,
            url: response.data[i].link,
          });
        }
      }
    }
    return events;
    // return events;
  } catch (error) {
    console.error(error);
  }
}

function fixDate(dataDate) {
  // unfinished, this would re arange date so it's easier to read
  dataDate.sort(function(a, b) {
    return a - b;
  });
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
  eventData(sources, 1, 1);
}, 86400000);
setInterval(function() {
  eventData(sources, 7, 0);
}, 604800000);
