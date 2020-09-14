import Character, { charStats } from './Character';

const typeList = Object.keys(charStats).slice(0, -1).map((type) => {
  return class Type extends Character {
    constructor(level) {
      super(level, type);
    }
  };
});

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  yield new allowedTypes[Math.round(Math.random() * allowedTypes.length)](maxLevel);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  return [characterGenerator(typeList, 1), characterGenerator(typeList, 1)];
}
