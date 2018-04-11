import express from 'express';
import { longWeekends, fetchHolidayEvents } from 'long-weekends';
import RSS from 'rss';

const PORT = process.env['PORT'] || '3333';
const BASE_URL = 'https://misc.tokyoenvious.net/holidays/holidays.html';

const dateYMD = function (dt: Date): string {
  const pad0 = (s: any): string => `0${s}`.substr(-2);
  return `${dt.getFullYear()}-${pad0(dt.getMonth() + 1)}-${pad0(dt.getDate())}`;
};

express()
  .get('/', (req, res) => {
    res.redirect(BASE_URL);
  })
  .get('/rss', async (req, res) => {
    const holidays = await fetchHolidayEvents({
      key: 'AIzaSyBtwQKokQJ4uQ1Oo8yuDop8RNQTmo9xWt0',
      calendarId: 'ja.japanese#holiday@group.v.calendar.google.com',
    });

    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    const result = await longWeekends(holidays, { baseDate: date });

    const feed = new RSS({
      title: '次の連休',
      site_url: BASE_URL,
      feed_url: 'https://japanese-long-weekends.herokuapp.com/rss',
    });

    let lead;
    if (result.active) {
      lead = '連休発生中です！！！';
    } else {
      lead = `次の連休は ${result.items[0].daysAhead} 日後です`;
      if (result.potentialItem) {
        lead += `が、${result.potentialItem.daysAhead} 日後に有給を取ると連休チャンス！`;
      }
    }

    const dd = req.query['d'] || '';
    let shown = true;
    if (dd) {
      shown = dd.split(/,/).some((s: string) => {
        const d = parseInt(s);
        return d === 0 ? result.active : d === result.items[0].daysAhead;
      });
    }

    if (shown) {
      feed.item({
        title: lead,
        url: BASE_URL,
        guid: BASE_URL + '#' + dateYMD(date),
        description: lead,
        date: date,
      });
    }

    const expires = new Date(date.getTime());
    expires.setDate(expires.getDate() + 1);
    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.set('Cache-Control', `public; max-age=${Math.floor((expires.getTime() - new Date().getTime()) / 1000)}`);
    res.set('Expires', expires.toUTCString());
    res.send(feed.xml({ indent: true }));
  })
  .listen(PORT)
  .on('listening', () => console.log(`started listening to :${PORT} ...`))
