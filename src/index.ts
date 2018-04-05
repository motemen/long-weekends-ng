import { longWeekends, fetchHolidayEvents } from 'long-weekends';
import * as Mustache from 'mustache';
import { doPartyHard } from './partyhard';
import './main.css';

import './pwabuilder-sw-register';

let today = new Date();

if (/^#(\d{4})-(\d{2})-(\d{2})$/.test(location.hash)) {
    today = new Date(parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10) - 1, parseInt(RegExp.$3, 10));
}

fetchHolidayEvents({
  key: 'AIzaSyBtwQKokQJ4uQ1Oo8yuDop8RNQTmo9xWt0',
  calendarId: 'ja.japanese#holiday@group.v.calendar.google.com'
})
.then((holidays) => longWeekends(holidays, { baseDate: today }))
.then((result) => {
  if (result.active) {
    doPartyHard({ apiKey: 'p40LyUPzKCKD0Sb5AJxzPFUy4kULrHhE41MFnBLHSRYarpPs8M' });
    document.body.style.color = 'white';
    document.querySelector('h1')!.insertAdjacentHTML('afterend', '<h1 style="color: black; background: yellow"><marquee><blink>連休発生中です！！！</blink></marquee></h1>');
    tweetButton('連休発生中です！！！');
    return;
  }

  const template = (document.querySelector('#template') as HTMLTextAreaElement).value;
  const dateYMD = function (dt: Date): string {
    const pad0 = (s: any): string => `0${s}`.substr(-2);
    return `${dt.getFullYear()}-${pad0(dt.getMonth() + 1)}-${pad0(dt.getDate())}`;
  };
  const suggestedWeekdayYMD = function (this: any) {
    return dateYMD(this.holidays.find((d: any) => !d.name).date);
  };
  for (let i = 1; i < result.items.length; i++) {
    (result.items[i] as any).daysAheadDelta = result.items[i].daysAhead - result.items[i-1].daysAhead - (result.items[i-1].holidays.length - 1)
  }
  const html = Mustache.render(
    template,
    {
      firstItem: result.items[0],
      restItems: result.items.slice(1),
      potentialItem: result.potentialItem,
      dateYMD: function () {
        return dateYMD(this.date);
      },
      suggestedWeekdayYMD,
    }
  );
  document.querySelector('#content-main')!.insertAdjacentHTML('afterbegin', html);

  const leadText = document.querySelector('#lead-text');
  if (leadText) {
    tweetButton(leadText.textContent!.replace(/^\s+|\s+$/g, ''));
  }

  if ('adsbygoogle' in window) {
    (window as any).adsbygoogle.push({});
  }
});

const tweetButton: { (text: string): void; done?: boolean } = (text: string) => {
  if (tweetButton.done) return;
  tweetButton.done = true;

  document.querySelector('#social')!.insertAdjacentHTML(
    'beforeend',
    '<a id="tweet" href="https://twitter.com/share" class="twitter-share-button" data-lang="ja"></a>'
  );
  document.querySelector('#tweet')!.setAttribute('data-text', text);

  !function(d,s,id){var js:any,fjs:any=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
}
