import Character, { charStats } from './Character';
import PositionedCharacter from './PositionedCharacter';
import { getRandomElement } from './utils';

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
  const level = Math.floor(Math.random() * maxLevel) + 1;
  yield new (getRandomElement(allowedTypes))(level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  while (team.length < characterCount) {
    team.push(...characterGenerator(allowedTypes, maxLevel));
  }
  return team;
}

export function generatePosition(characterList, boardSize, side) {
  const restrictor = (_, i) => side === 'evil' ? i * boardSize : i * boardSize + boardSize - 2;
  const vertLine = Array(boardSize).fill('').map(restrictor);
  const availablePosition = [...vertLine, ...vertLine.map((el) => el + 1)];
  const position = [];
  while (position.length < characterList.length) {
    const point = availablePosition[Math.floor(Math.random() * boardSize * 2)];
    if (!position.includes(point)) position.push(point);
  }
  return characterList.map((character, i) => new PositionedCharacter(character, position[i]));
}
