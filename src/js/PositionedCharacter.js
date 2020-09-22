import Character from './Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this.position = position;
  }

  getMessage() {
    return `\u{1F396} ${this.character.level}`
    + `\n\u{2694} ${this.character.attack}`
    + `\n\u{1F6E1} ${this.character.defense}`
    + `\n\u{2764} ${this.character.health}`;
  }
}
