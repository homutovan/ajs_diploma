import Character, { charStats } from './Character';
import PositionedCharacter from './PositionedCharacter';
import { getRandomElement } from './utils';
import themes from './themes';

export const typeList = Object.keys(charStats)
  .map((type) => class extends Character {
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
export function* characterGenerator(allowedTypes, maxLevel, characterCount, side) {
  let counter = 0;
  while (counter < characterCount) {
    const level = Math.floor(Math.random() * maxLevel) + 1;
    const character = new (getRandomElement(allowedTypes))(level);
    if (character.side === side) {
      counter += 1;
      // console.log(character);
      yield character;
    }
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount, side) {
  const generator = characterGenerator(allowedTypes, maxLevel, characterCount, side);
  return [...generator];
}

export function generatePosition(characterList, boardSize, playerSide) {
  const location = characterList[0].side === playerSide;
  const restrictor = (_, i) => (location ? (i * boardSize) : (i * boardSize + boardSize - 2));
  const vertLine = Array(boardSize).fill('').map(restrictor);
  const availablePosition = [...vertLine, ...vertLine.map((el) => el + 1)]; /// подумать над механизмом расширения полосы
  const position = availablePosition.sort(() => Math.random() - 0.5).slice(0, characterList.length);
  return characterList.map((character, i) => new PositionedCharacter(character, position[i]));
}

export function* generateTheme(startTheme = 0) {
  const themeList = Object.keys(themes);
  const start = startTheme % 4;
  const len = themeList.length;
  while (true) {
    for (let i = start; i < len; i += 1) {
      yield themeList[i];
    }
  }
}
