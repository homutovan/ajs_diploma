import { getRandomElement, calcDamage, getPropagation } from './utils';

export default class Estimator {
  constructor(game) {
    this.game = game;
    this.side = this.game.enemySide;
  }

  requestStrategy() {
    console.log('request');
    console.log(this.side);
    if (!(this.side === this.game.side)) {
      this.smartStrategy();
    } else {
      this.randomStrategy();
    }
    return null;
  }

  smartStrategy() {
    console.log('smart');
    this.firingZone = this.getFiringZone();
    this.availableCharacter = this.game.playerCharacterCells;
    if (this.revengeStrategy()) {
      return null;
    } else if (this.attackStrategy()) {
      return null;
    } else if (this.tacticalRetreat()) {
      return null;
    } else {
      this.randomStrategy();
    }
    return null;
  }



  tacticalRetreat() {
    for (const index of this.availableCharacter) {
      if (this.firingZone.includes(index)) {
        this.game.activatePosition(index);
        const availableCells = this.game.transitionСells;
        const saveCells = availableCells
          .filter((element) => !this.firingZone.includes(element));
        if (saveCells.length) {
          const moveTarget = getRandomElement(saveCells);
          this.game.action = this.game.movePosition;
          this.game.tracedAction(moveTarget);
          return true;
        }
      }
    }
    return false;
  }

  getFiringZone() {
    const enemyCharacter = this.game.enemyCharacterCells;
    let firingZone = new Set();
    for (const index of enemyCharacter) {
      const position = this.game.team.getPositionByIndex(index);
      const { character: { range } } = position;
      const dangerCells = getPropagation(index, range, this.game.boardSize);
      const prey = this.availableCharacter.filter((element) => dangerCells.includes(element));
      firingZone = new Set([...dangerCells, ...firingZone]);
    }
    return [...firingZone];
  }

  attackStrategy() {
    console.log('attackStrategy');
    const bestTargets = [];
    for (const index of this.availableCharacter) {
      this.game.activatePosition(index);
      const { character: { attack: selfAttack, defense: selfDefense } } = this.game.activePosition;
      const availableTargets = this.game.attackСells;
      for (const target of availableTargets) {
        const { character: { attack: otherAttack, defense: otherDefense } } = this.game.team.getPositionByIndex(target);
        const selfDamage = calcDamage(selfAttack, otherDefense);
        const otherDamage = calcDamage(otherAttack, selfDefense);
        bestTargets.push({
          damage: selfDamage,
          index,
          target,
        });
      }
    }
    const selectTarget = bestTargets.sort((a, b) => b.damage - a.damage)[0];
    if (selectTarget) {
      const { index, target } = selectTarget;
      this.game.activatePosition(index);
      this.game.action = this.game.attackPosition;
      this.game.tracedAction(target);
      return true;
    }
    return false;
  }

  revengeStrategy() {
    console.log('revengeStrategy');
    const { action, from, to } = this.game.gameState.getLastTurn();
    if (action === 'attackPosition' && this.availableCharacter.includes(to)) {
      this.game.activatePosition(to);
      if (this.game.attackСells.includes(from)) {
        this.game.action = this.game.attackPosition;
        this.game.tracedAction(from);
        return true;
      }
    }
    return false;
  }

  async randomStrategy() {
    console.log('random');
    const availableCharacter = this.game.playerCharacterCells;
    let loop = true;
    while (loop) {
      const selectIndex = getRandomElement(availableCharacter);
      this.game.activatePosition(selectIndex);
      const moveTarget = getRandomElement(this.game.transitionСells);
      const attackTarget = getRandomElement(this.game.attackСells);
      if (attackTarget) {
        this.game.action = this.game.attackPosition;
      } else if (moveTarget) {
        this.game.action = this.game.movePosition;
      } else {
        continue;
      }
      loop = false;
      this.game.tracedAction(attackTarget || moveTarget);
    }
  }
}
