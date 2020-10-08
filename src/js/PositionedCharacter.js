import Character from './Character';
import { getPropagation, getExtraRestriction } from './utils';

export default class PositionedCharacter {
  constructor(character, position, boardSize) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    if (typeof boardSize !== 'number') {
      throw new Error('boardSize must be a number');
    }

    this.character = character;
    this.position = position;
    this.boardSize = boardSize;
    this.team = '';
  }

  // get position() {
  //   return this._position;
  // }

  // set position(value) {
  //   this._position = value;
  // }

  // applyRestriction(propogation, restriction, initRadius) {
  //   const currentRestriction = restriction
  //     .filter((element) => propogation.includes(element));
  //   const rowPosition = Math.floor(this.position / this.boardSize);
  //   const colPosition = this.position % this.boardSize;
  //   const extraRestriction = [];
  //   for (const point of currentRestriction) {
  //     const rowPoint = Math.floor(point / this.boardSize);
  //     const deltaRow = rowPoint - rowPosition;
  //     const colPoint = this.position % this.boardSize;
  //     const deltaCol = colPoint - colPosition;
  //     const deltaPoint = deltaRow * this.boardSize + deltaCol;
  //     const radius = deltaRow || deltaCol;
  //     for (let step = radius; step <= initRadius; step += 1) {
  //       const nextPoint = point + deltaPoint;
  //       extraRestriction.push(nextPoint);
  //     }
  //   }
  //   return extraRestriction;
  // }

  getTransition() {
    // console.log(this.team.allIndex);
    const { distance } = this.character;
    const { position, boardSize } = this;
    const propogation = getPropagation(this.position, distance, this.boardSize);
    const restriction = this.team.allIndex;
    const extraRestriction = getExtraRestriction(propogation, restriction, distance, position, boardSize);
    return propogation
      .filter((element) => !restriction.includes(element))
      .filter((element) => !extraRestriction.includes(element));
  }

  getAttack() {
    const { range } = this.character;
    return getPropagation(this.position, range, this.boardSize);
  }

  getMessage() {
    return `\u{1F396} ${this.character.level}`
    + `\n\u{2694} ${this.character.attack}`
    + `\n\u{1F6E1} ${this.character.defense}`
    + `\n\u{2764} ${this.character.health}`;
  }
}
