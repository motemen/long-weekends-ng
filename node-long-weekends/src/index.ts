import 'isomorphic-fetch';

export interface FetchOptions {
  key: any;
  calendarId: string;
}

interface EventsListResponse {
  items: CalendarEvent[];
}

export interface CalendarEvent {
  start: {
    date: string;
  };
  summary: string;
}

export function fetchHolidayEvents(options: FetchOptions): Promise<CalendarEvent[]> {
  return fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(options.calendarId)}/events` +
    `?key=${encodeURIComponent(options.key)}` +
    `&fields=${encodeURIComponent('items(start,summary)')}`,
  )
  .then((res) => res.json())
  .then((res: EventsListResponse) => res.items);
}

export interface LongWeekendsResult {
  active: boolean;
  items: LongWeekend[];
  potentialItem?: LongWeekend;
}

export interface LongWeekend {
  daysAhead: number;
  holidays: Holiday[];
}

export interface Holiday {
  name: string;
  date: Date;
}

export interface Options {
  baseDate?: Date;
}

const ONE_MINUTE_IN_MSECS = 60 * 1000;
const ONE_DAY_IN_MINUTES  = 24 * 60;
const ONE_DAY_IN_MSECS    = ONE_DAY_IN_MINUTES * ONE_MINUTE_IN_MSECS;

export function longWeekends(holidays: CalendarEvent[], options: Options = {}): LongWeekendsResult {
  const baseDate = options.baseDate || new Date();
  const tzOffsetMinutes = baseDate.getTimezoneOffset();

  const dateOffset = (date: Date): number =>
    Math.floor((date.getTime() - tzOffsetMinutes * ONE_MINUTE_IN_MSECS) / ONE_DAY_IN_MSECS);

  const offsetToDate = (offset: number): Date =>
    new Date((offset * ONE_DAY_IN_MINUTES + tzOffsetMinutes) * ONE_MINUTE_IN_MSECS);

  const today = dateOffset(baseDate);

  const holidayName: { [offset: number]: string } = {};
  const nextToWeekend: { [offset: number]: string } = {};

  for (let offset = (7 + (7 - 1) - baseDate.getDay()) % 7 - 7; offset <= 365 ; offset += 7) {
    holidayName[today + offset] = '土曜日';
    holidayName[today + offset + 1] = '日曜日';

    nextToWeekend[today + offset - 1] = '金曜日';
    nextToWeekend[today + offset + 1 + 1] = '月曜日';
  }

  const result: LongWeekendsResult = {
    active: false,
    items: [],
  };

  let nextHolidayOffset = +Infinity;

  for (const holiday of holidays) {
    const offset = dateOffset(ymdToDate(holiday.start.date));

    if (offset < nextHolidayOffset) {
      nextHolidayOffset = offset;
    }

    holidayName[offset] = holiday.summary;
  }

  for (let i = today - 2, count = 0; i <= today + 2; ) {
    if (holidayName[i++]) {
      count++;
    } else {
      count = 0;
    }

    if (count >= 3) {
      result.active = true;
    }
  }

  for (let i = Math.max(nextHolidayOffset - 2, today + 1), done = 0; i < today + 365; ++i) {
    if (holidayName[i] && holidayName[i + 1] && holidayName[i + 2]) {
      // found successive holidays = long weekend
      const item: LongWeekend = { daysAhead: i - today, holidays: [] };
      result.items.push(item);

      for (; holidayName[i]; ++i) {
        item.holidays.push({
          date: offsetToDate(i),
          name: holidayName[i],
        });
      }
      i--;
      done++;
    } else if (done === 0 && !result.potentialItem) {
      let chanceOffset;
      if (holidayName[i] && nextToWeekend[i + 1] && holidayName[i + 2] && holidayName[i + 3]) {
        chanceOffset = i + 1;
      } else if (holidayName[i] && holidayName[i + 1] && nextToWeekend[i + 2] && holidayName[i + 3]) {
        chanceOffset = i + 2;
      }

      if (chanceOffset) {
        const item: LongWeekend = { daysAhead: i - today, holidays: [] };
        for (; holidayName[i] || nextToWeekend[i]; ++i) {
          item.holidays.push({
            date: offsetToDate(i),
            name: holidayName[i],
          });
        }
        result.potentialItem = item;
      }
    }
  }

  return result;
}

function ymdToDate(ymd: string): Date {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)!;
    return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
}
