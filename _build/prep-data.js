import updateSchedule from './update-schedule';

(async function() {
  console.log('prepping data!');

  await updateSchedule();

  console.log('done!');
})();
