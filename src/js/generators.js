import Character, { charStats } from './Character';

export const typeList = Object.keys(charStats).slice(0, -1).map((type) => class Type extends Character {
  constructor(level) {
    super(level, type);
  }
});

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const type = Math.round(Math.random() * allowedTypes.length)
  const level = Math.round(Math.random() * maxLevel)
  yield new allowedTypes[type](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  return [characterGenerator(typeList, 1), characterGenerator(typeList, 1)];
}
