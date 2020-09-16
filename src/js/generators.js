import Character, { charStats } from './Character';
import PositionedCharacter from './PositionedCharacter';

export const typeList = Object.keys(charStats).map((type) => class extends Character {
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
  const type = Math.floor(Math.random() * allowedTypes.length);
  const level = Math.round(Math.random() * maxLevel);
  yield new allowedTypes[type](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  return [characterGenerator(typeList, 1), characterGenerator(typeList, 1)];
}

export function generatePosition(characterList) {
  const position = Array(characterList.length).fill(1).map(() => Math.floor(Math.random() * 64));
  return characterList.map((character, i) => new PositionedCharacter(character, position[i]));
}
