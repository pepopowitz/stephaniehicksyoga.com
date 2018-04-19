import transform from './transform';
import { nowUtc } from './clock';

import {
  values,
  dates,
  aLocation,
  anIndividualClass,
  aWeeklyClass,
  aCancellation,
} from './transform.fixture';

jest.mock('./clock', () => ({
  nowUtc: jest.fn(),
}));

describe('transform', () => {
  beforeEach(() => {
    nowUtc.mockReturnValue(dates.today);
  });

  describe('individualClasses', () => {
    it('ignores individualClasses earlier than today', () => {
      const now = dates.inTheFuture;
      nowUtc.mockReturnValue(now);

      const updates = {
        locations: [aLocation()],
        individualClasses: [anIndividualClass()],
      };

      const result = transform(updates);

      expect(result).toEqual([]);
    });

    it('adds individualClasses after today', () => {
      const now = dates.aWhileAgo;
      nowUtc.mockReturnValue(now);

      const data = {
        locations: [aLocation()],
        individualClasses: [anIndividualClass()],
      };

      const result = transform(data);

      expect(result).toEqual([
        {
          location: values.locationTitle,
          locationUrl: values.locationUrl,
          date: 'Thursday, April 12',
          dateRaw: '2018-04-12',
          time: '6:00pm - 7:15pm',
          startTimeRaw: '18:00',
          summary: values.summary,
        },
      ]);
    });
  });

  describe('weeklyClasses', () => {
    it('ignores weeklyClasses that ended', () => {
      const data = {
        locations: [aLocation()],
        weeklyClasses: [
          aWeeklyClass({
            endDate: dates.aWhileAgo,
          }),
        ],
      };

      const result = transform(data);

      expect(result).toEqual([]);
    });

    it('includes weeklyClasses that have started, with no end date', () => {
      const data = {
        locations: [aLocation()],
        weeklyClasses: [aWeeklyClass()],
      };

      const result = transform(data);

      expect(result.length).toBeGreaterThan(0);
    });

    it('includes weeklyClasses that havent ended yet', () => {
      const data = {
        locations: [aLocation()],
        weeklyClasses: [
          aWeeklyClass({
            endDate: dates.wayInTheFuture,
          }),
        ],
      };

      const result = transform(data);

      expect(result.length).toBeGreaterThan(0);
    });

    it('expands weeklyClasses that are within range', () => {
      const updates = {
        locations: [aLocation()],
        weeklyClasses: [aWeeklyClass()],
      };

      const result = transform(updates);

      expect(result.length).toEqual(50);
      expect(result[0]).toEqual({
        title: values.title,
        location: values.locationTitle,
        locationUrl: values.locationUrl,
        date: 'Wednesday, April 11',
        dateRaw: '2018-04-11',
        time: '6:00pm - 7:15pm',
        startTimeRaw: '18:00',
        summary: values.summary,
      });
    });

    it('generates weeklyClasses on the correct day of week', () => {
      const now = dates.monday;
      nowUtc.mockReturnValue(now);

      const updates = {
        locations: [aLocation()],
        weeklyClasses: [aWeeklyClass()],
      };

      const result = transform(updates);

      expect(result[0].dateRaw).toEqual('2018-04-11');
    });
  });

  describe('cancellations', () => {
    it('doesnt do anything if the cancellation is out of range', () => {
      const cancellation = aCancellation();
      cancellation.date = dates.aWhileAgo;

      const data = {
        locations: [aLocation()],
        weeklyClasses: [aWeeklyClass()],
        cancellations: [cancellation],
      };

      const result = transform(data);

      expect(
        result.find(item => item.date === 'Wednesday, May 2')
      ).toBeTruthy();
    });

    it('removes a weekly class instance if the cancellation is within range', () => {
      const cancellation = aCancellation();
      cancellation.date = dates.inTheFuture;

      const data = {
        locations: [aLocation()],
        weeklyClasses: [aWeeklyClass()],
        cancellations: [cancellation],
      };

      const result = transform(data);

      expect(
        result.find(item => item.date === 'Wednesday, May 2')
      ).toBeUndefined();
    });
  });

  it('sorts classes from now to future', () => {
    const cancellation = aCancellation();
    cancellation.date = dates.inTheFuture;

    const data = {
      locations: [aLocation()],
      weeklyClasses: [aWeeklyClass()],
      cancellations: [cancellation],
      individualClasses: [anIndividualClass()],
    };

    const result = transform(data);

    const scheduleDates = result.map(date => date.dateRaw).slice(0, 5);
    expect(scheduleDates).toEqual([
      '2018-04-11',
      '2018-04-12',
      '2018-04-18',
      '2018-04-25',
      '2018-05-09',
    ]);
  });

  it('sorts same day classes by start time', () => {
    const evening = anIndividualClass();
    evening.startTime = '10:00 PM';
    evening.endTime = '10:45 PM';
    const morning = anIndividualClass();
    morning.startTime = '11:00 AM';
    morning.endTime = '11:45 AM';

    const data = {
      locations: [aLocation()],
      individualClasses: [evening, morning],
    };

    const result = transform(data);

    const scheduleDates = result.map(date => date.time);
    expect(scheduleDates).toEqual([
      '11:00 AM - 11:45 AM',
      '10:00 PM - 10:45 PM',
    ]);
  });
});
