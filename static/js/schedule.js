Vue.component('schedule-day', {
  props: ['day'],
  template: `
  <article class="upcoming-class">
    <h2 class="day">{{ day.date }}</h2>
    <div class="class-details" is="schedule-item" v-for="(item, index) in day.classes" v-bind:item="item">
    </div>
  </article>`,
});

Vue.component('schedule-item', {
  props: ['item'],
  template: `
    <div class="class-details">
      <h3 class="time">{{ item.time }}</h3>
      <h3 class="location"><a v-bind:href="item.locationUrl">{{ item.location }}</a></h3>
      <h3 class="details">{{ item.summary }}</h3>
    </div>`,
});

function groupByDay(classes) {
  const grouped = classes.reduce((acc, curr) => {
    if (acc[curr.date]) {
      return {
        ...acc,
        [curr.date]: [...acc[curr.date], curr],
      };
    } else {
      return {
        ...acc,
        [curr.date]: [curr],
      };
    }
  }, {});

  return Object.keys(grouped).map(key => {
    const classes = grouped[key];
    return {
      date: classes[0].date,
      classes,
    };
  });
}

new Vue({
  el: '#schedule',
  data: {
    days: [],
  },
  mounted() {
    axios.get('/_data/classes/upcoming.json').then(response => {
      const endOfYesterday = dateFns.endOfYesterday();
      const nextWeek = dateFns.addWeeks(dateFns.endOfToday(), 1);
      this.days = groupByDay(
        response.data.filter(item =>
          dateFns.isWithinRange(item.dateRaw, endOfYesterday, nextWeek)
        )
      );
    });
  },
});
