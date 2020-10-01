import Character, { charStats } from './Character';
import PositionedCharacter from './PositionedCharacter';
import { getRandomElement } from './utils';
import themes from './themes';

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
  console.log('characterGenerator');
  console.log(allowedTypes, maxLevel);
  const level = Math.floor(Math.random() * maxLevel) + 1;
  yield new (getRandomElement(allowedTypes))(level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  console.log('generateTeam');
  console.log(`maxLevel: ${maxLevel}`)
  const team = [];
  console.log(characterCount);
  while (team.length < characterCount) {
    console.log(team.length);
    // team.push(1);
    team.push(...characterGenerator(allowedTypes, maxLevel));
  }
  return team;
}

export function generatePosition(characterList, boardSize, side) {
  console.log('generatePosition');
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

// export function getTemplatePosition(numberCharacters) {
//   const character = new typeList[0](1);
//   const posCharacter = new PositionedCharacter(character, -1);
//   return Array(numberCharacters).fill(posCharacter);
// }

export function* generateTheme(startTheme = 'prairie') {
  const themeList = Object.keys(themes);
  const start = themeList.indexOf(startTheme)
  const len = themeList.length;
  while (true) {
    for (let i = start; i < len; i += 1) {
      yield themeList[i];
    }
  }
}

