import parse from 'date-fns/parse';
import format from 'date-fns/format';
import eachDay from 'date-fns/each_day';
import addWeeks from 'date-fns/add_weeks';
import max from 'date-fns/max';
// no, YOU just imported the third f'ing date library into this project.
import moment from 'moment';

import sortBy from 'lodash.sortby';

import { nowUtc } from './clock';

export default function(data) {
  const weeklyClasses = generateWeeklyClasses(data);

  const unsorted = [...weeklyClasses, ...generateIndividualClasses(data)];
  return sortBy(unsorted, ['dateRaw', 'startTimeRaw']).slice(0, 100);
}

function formatDate(date, fmt = 'dddd, MMMM D') {
  return format(parse(date), fmt);
}

function formatTimeRange(startTime, endTime) {
  return `${startTime} - ${endTime}`;
}

function formatTime(time, fmt) {
  return moment(time, 'h:mm A').format(fmt);
}

function generateIndividualClasses(data) {
  if (!data.individualClasses) {
    return [];
  }

  const locationUrls = makeLocationLookup(data);

  const classes = Object.entries(data.individualClasses)
    .map(entry => entry[1])
    .filter(_class => parse(_class.date) >= parse(nowUtc()));

  return classes.map(_class => ({
    location: _class.location,
    locationUrl: locationUrls[_class.location],
    date: formatDate(_class.date),
    dateRaw: formatDate(_class.date, 'YYYY-MM-DD'),
    time: formatTimeRange(_class.startTime, _class.endTime),
    startTimeRaw: formatTime(_class.startTime, 'HH:mm'),
    summary: _class.summary,
  }));
}

function weeklyClassIsNotOver(weekly) {
  const parsedNow = parse(nowUtc());

  return weekly.endDate === undefined || parse(weekly.endDate) >= parsedNow;
}

function getWeeklyClassesWithinRange(data) {
  const current = Object.entries(data.weeklyClasses)
    .map(entry => entry[1])
    .filter(weeklyClassIsNotOver);

  return current;
}

function expandWeeklyClass(weekly, locationUrls) {
  const endDate = weekly.endDate || addWeeks(parse(weekly.startDate), 5);
  const startDate = max(weekly.startDate, nowUtc());
  const dates = eachDay(startDate, endDate, 7).slice(0, 50);

  return dates.map(date => ({
    title: weekly.title,
    location: weekly.location,
    locationUrl: locationUrls[weekly.location],
    date: formatDate(date),
    dateRaw: formatDate(date, 'YYYY-MM-DD'),
    time: formatTimeRange(weekly.startTime, weekly.endTime),
    startTimeRaw: formatTime(weekly.startTime, 'HH:mm'),
    summary: weekly.summary,
  }));
}

function generateWeeklyClasses(data) {
  if (!data.weeklyClasses) {
    return [];
  }

  const locationUrls = makeLocationLookup(data);

  const withinRange = getWeeklyClassesWithinRange(data);

  const schedule = withinRange.reduce((acc, curr) => {
    return [...acc, ...expandWeeklyClass(curr, locationUrls)];
  }, []);

  const validCancellations = getCancellationsWithinRange(data);
  const minusCancellations = schedule.filter(_class => {
    return (
      validCancellations.find(
        cancellation =>
          cancellation.class === _class.title &&
          cancellation.date === _class.dateRaw
      ) === undefined
    );
  });
  return minusCancellations;
}

function makeLocationLookup(data) {
  const result = data.locations.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.title]: curr.url,
    };
  }, {});
  return result;
}

function getCancellationsWithinRange(data) {
  if (!data.cancellations) {
    return [];
  }
  return Object.entries(data.cancellations)
    .map(entry => entry[1])
    .filter(cancellation => parse(cancellation.date) >= parse(nowUtc()));
}
