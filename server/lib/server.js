"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const long_weekends_1 = require("long-weekends");
const rss_1 = __importDefault(require("rss"));
const PORT = process.env['PORT'] || '3333';
const BASE_URL = 'https://misc.tokyoenvious.net/holidays/holidays.html';
const dateYMD = function (dt) {
    const pad0 = (s) => `0${s}`.substr(-2);
    return `${dt.getFullYear()}-${pad0(dt.getMonth() + 1)}-${pad0(dt.getDate())}`;
};
express_1.default()
    .get('/', (req, res) => {
    res.redirect(BASE_URL);
})
    .get('/rss', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const holidays = yield long_weekends_1.fetchHolidayEvents({
        key: 'AIzaSyBtwQKokQJ4uQ1Oo8yuDop8RNQTmo9xWt0',
        calendarId: 'ja.japanese#holiday@group.v.calendar.google.com',
    });
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const result = yield long_weekends_1.longWeekends(holidays, { baseDate: date });
    const feed = new rss_1.default({
        title: '次の連休',
        site_url: BASE_URL,
        feed_url: 'https://japanese-long-weekends.herokuapp.com/rss',
    });
    let lead;
    if (result.active) {
        lead = '連休発生中です！！！';
    }
    else {
        lead = `次の連休は ${result.items[0].daysAhead} 日後です`;
        if (result.potentialItem) {
            lead += `が、${result.potentialItem.daysAhead} 日後に有給を取ると連休チャンス！`;
        }
    }
    const dd = req.query['d'] || '';
    let shown = true;
    if (dd) {
        shown = dd.split(/,/).some((s) => {
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
}))
    .listen(PORT)
    .on('listening', () => console.log(`started listening to :${PORT} ...`));
