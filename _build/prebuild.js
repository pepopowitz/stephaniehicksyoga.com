import updateSchedule from './update-schedule';

(async function() {
  console.log('prebuilding!');

  await updateSchedule();

  console.log('done!');
})();
