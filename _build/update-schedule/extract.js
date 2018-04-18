import fs from 'fs';
import fsExtra from 'fs-extra';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

export default async function() {
  console.log('Extracting data...');

  const promises = [
    getAllInDirectory('_data/classes/cancellations'),
    getAllInDirectory('_data/classes/individual-classes'),
    getAllInDirectory('_data/classes/locations'),
    getAllInDirectory('_data/classes/weekly-classes'),
  ];

  const [
    cancellations,
    individualClasses,
    locations,
    weeklyClasses,
  ] = await Promise.all(promises);

  return {
    cancellations,
    individualClasses,
    locations,
    weeklyClasses,
  };
}

async function getAllInDirectory(directory) {
  const files = await readdir(directory);

  const promises = files.map(file => getContents(file, directory));

  const results = await Promise.all(promises);

  return results;
}

async function getContents(file, directory) {
  const json = await fsExtra.readJson(`${directory}/${file}`);

  return {
    ...json,
    id: file,
  };
}
