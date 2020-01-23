const axios = require('axios').default;
const eventBot = require('./eventBot.js');

const astoriaCreatives = 'http://api.meetup.com/AstoriaCreatives/events';
const astoriaWriters = 'http://api.meetup.com/astoriawritersgroup/events';
const astoriaTech = 'http://api.meetup.com/Astoria-Tech-Meetup/events';
const queensTech = 'http://api.meetup.com/Queens-Tech-Night/events';
const designDriven = 'http://api.meetup.com/Design-Driven-NYC/events/';
const qed =
  'https://www.googleapis.com/calendar/v3/calendars/b9cmt5r1ikc6ho8ego41l9dl5iijj2nf@import.calendar.google.com/events';
const events = [];
async function getEvents(url, timeFrame) {
  try {
    const response = await axios.get(url);
    for (let i = 0; i < response.data.length; i += 1) {
      if (response.data[i].time > Date.now() + timeFrame * 86400000) {
        events.unshift({
          title: response.data[i].name,
          date: response.data[i].local_date,
          url: response.data[i].link,
        });
        return events;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const eventData = async () => {
  try {
    const myData = await getEvents(astoriaTech, 1);
    eventBot.slackSend(1, myData);
  } catch (error) {
    console.error(error);
  }
};

eventData();
