import fs from 'fs-extra';

export default async function(schedule) {
  await fs.writeJson('_data/classes/upcoming.json', schedule, { spaces: 2 });

  return true;
}
