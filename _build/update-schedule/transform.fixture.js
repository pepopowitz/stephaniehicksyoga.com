export const values = {
  title: 'title',
  dayOfWeek: 'Wednesday',
  startDate: '2018-04-01',
  endDate: '2020-04-01',
  startTime: '6:00pm',
  endTime: '7:15pm',
  summary: 'class summary',
  locationTitle: 'tosa yoga',
  locationUrl: 'tosa yoga url',
};

// all are wednesdays, except tomorrow.
export const dates = {
  aWhileAgo: '2018-01-03',
  today: '2018-04-11',
  tomorrow: '2018-04-12',
  inTheFuture: '2018-05-02',
  wayInTheFuture: '2018-10-03',
};

export function anIndividualClass() {
  return {
    title: values.title,
    date: dates.tomorrow,
    startTime: values.startTime,
    endTime: values.endTime,
    summary: values.summary,
    location: values.locationTitle,
  };
}

export function aWeeklyClass(specs) {
  return {
    title: values.title,
    dayOfWeek: values.dayOfWeek,
    startDate: values.startDate,
    endDate: values.endDate,
    startTime: values.startTime,
    endTime: values.endTime,
    summary: values.summary,
    location: values.locationTitle,
    ...specs,
  };
}

export function aLocation() {
  return {
    title: values.locationTitle,
    url: values.locationUrl,
  };
}

export function aCancellation() {
  return {
    title: 'Spring break',
    class: values.title,
    date: dates.inTheFuture,
  };
}
