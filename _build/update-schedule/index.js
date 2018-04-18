import extract from './extract';
import transform from './transform';
import persist from './persist';

export default async function() {
  const data = await extract();

  const schedule = transform(data);

  await persist(schedule);

  return true;
}
