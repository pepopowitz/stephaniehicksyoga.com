Vue.component('schedule-item', {
  props: ['item'],
  template: `
  <article class="upcoming-class">
    <h2 class="day">{{ item.date }}</h2>
    <div class="class-details">
      <h3 class="time">{{ item.time }}</h3>
      <h3 class="location"><a v-bind:href="item.locationUrl">{{ item.location }}</a></h3>
      <h3 class="details">{{ item.summary }}</h3>
    </div>
  </article>`,
});

new Vue({
  el: '#schedule',
  data: {
    classes: [],
  },
  mounted() {
    axios.get('/_data/classes/upcoming.json').then(response => {
      const endOfYesterday = dateFns.endOfYesterday();
      const nextWeek = dateFns.addWeeks(dateFns.endOfToday(), 1);
      this.classes = response.data.filter(item =>
        dateFns.isWithinRange(item.dateRaw, endOfYesterday, nextWeek)
      );
    });
  },
});
