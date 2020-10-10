import {
  getRandomElement,
  calcDamage,
  getPropagation,
  getDescription,
  distanceMetric,
  getAnchorPoint,
} from './utils';

export default class Estimator {
  constructor(game) {
    this.game = game;
    this.side = this.game.enemySide;
  }

  requestStrategy() {
    console.log('request');
    // console.log(this.side);
    if (!(this.side === this.game.side)) {
      this.smartStrategy();
    } else {
      this.randomStrategy();
    }
    return null;
  }

  smartStrategy() {
    console.log('smart');
    ({
      playerCharacterCells: this.availableCharacter,
      enemyCharacterCells: this.enemyCharacter,
      characterCells: this.allCharacter,
      boardSize: this.boardSize,
    } = this.game);
    this.firingZone = this.getFiringZone();
    if (this.smartAction()) {
      return null;
    } else if (this.attackStrategy()) {
      // console.log('attackStrategy');
      return null;
    } else if (this.tacticalRetreat()) {
      return null;
    } else if (this.agressiveStrategy()) {
      // console.log('agressiveStrategy');
      return null;
    } else {
      console.log('#########################################');
      this.smartRandomStrategy();
    }
    return null;
  }

  agressiveStrategy() {
    console.log('agressive');
    const anchorPoint = getAnchorPoint(this.enemyCharacter, this.boardSize);
    const metric = (point) => distanceMetric(point, anchorPoint, this.boardSize);
    const sortToFar = this.availableCharacter.sort((a, b) => metric(b) - metric(a));
    for (const index of sortToFar) {
      this.game.activatePosition(index);
      const availableCells = this.game.transitionСells;
      if (availableCells.length) {
        const sortToNear = availableCells.sort((a, b) => metric(a) - metric(b));
        const saveCells = sortToNear
          .filter((element) => !this.firingZone.includes(element));
        const moveTarget = saveCells[0];
        if (metric(moveTarget) < metric(index)) {
          this.game.action = this.game.movePosition;
          this.game.tracedAction(moveTarget);
          return true;
        }
      }
    }
    return false;
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
    let firingZone = new Set();
    for (const index of this.enemyCharacter) {
      const position = this.game.team.getPositionByIndex(index);
      const dangerCells = position.getAttackArea();
      firingZone = new Set([...dangerCells, ...firingZone]);
    }
    return [...firingZone];
  }

  smartAction() {
    console.log('smartAction');
    const targetList = [
      ...this.getTargetList(this.availableCharacter),
      ...this.getTargetList(this.enemyCharacter, true),
    ];
    console.log(targetList);
    if (targetList.length) {
      const bestTargets = targetList.sort((a, b) => b.resultRate - a.resultRate);
      let prevTarget = {};
      for (const target of bestTargets) {
        const {
          selfPosition,
          otherPosition,
          possibleAttackRate,
          possibleTarget,
          attackRate,
          retreatRate,
          resultRate,
        } = target;
        console.log(target);
        this.game.activatePosition(selfPosition);
        if (retreatRate > attackRate) {
          console.log('retreat');
          const availableCells = this.game.transitionСells;
          const saveCells = availableCells
            .filter((element) => !this.firingZone.includes(element));
            // подумать над сортировкой по удаленности
          if (saveCells.length) {
            console.log('save');
            const moveTarget = getRandomElement(saveCells);
            this.game.action = this.game.movePosition;
            this.game.tracedAction(moveTarget);
            return true;
          } else {
            const rateList = bestTargets
              .map((element) => element.attackRate);
            console.log(rateList);
            if (possibleAttackRate > Math.max(...rateList)) {
              console.log('move possible');
              const feasibleCells = possibleTarget
                .filter((element) => !this.allCharacter.includes(element));
              const possible = getRandomElement(feasibleCells);
              if (possible) {
                this.game.action = this.game.movePosition;
                this.game.tracedAction(possible);
                return true;
              }
            } else {
              const prevAttackRate = prevTarget.attackRate;
              if (prevAttackRate && prevAttackRate > resultRate) {
                this.game.activatePosition(prevTarget.selfPosition);
                this.game.action = this.game.attackPosition;
                this.game.tracedAction(prevTarget.otherPosition);
                return true;
              }
              prevTarget = target;
            }
          }
        } else {
          console.log('attack');
          this.game.action = this.game.attackPosition;
          this.game.tracedAction(otherPosition);
          return true;
        }
      }
    }
    return false;
  }

  getTargetList(characterList, enemy = false) {
    // console.log('getTargetList');
    const targetList = [];
    for (const index of characterList) {
      const selfUnit = this.game.team.getPositionByIndex(index);
      const availableTargets = selfUnit.getAttack();

      for (const target of availableTargets) {
        const otherUnit = this.game.team.getPositionByIndex(target);
        let relevanceDescription = '';
        if (enemy) {
          relevanceDescription = getDescription(otherUnit, selfUnit, this.game.boardSize);
        } else {
          relevanceDescription = getDescription(selfUnit, otherUnit, this.game.boardSize);
        }
        targetList.push(relevanceDescription);
      }
    }
    return targetList;
  }

  attackStrategy() {
    const bestTargets = [];
    for (const index of this.availableCharacter) {
      this.game.activatePosition(index);
      const {
        character: {
          attack: selfAttack,
          defense: selfDefense,
          // range: selfRange,
        },
      } = this.game.activePosition;
      const availableTargets = this.game.attackСells;
      for (const target of availableTargets) {
        const {
          character: {
            attack: otherAttack,
            defense: otherDefense,
            distance: otherRange,
            health: otherHealth,
          },
        } = this.game.team.getPositionByIndex(target);
        const selfDamage = calcDamage(selfAttack, otherDefense);
        const otherDamage = calcDamage(otherAttack, selfDefense);
        const distance = distanceMetric(index, target, this.game.boardSize);
        if (selfDamage >= otherHealth || selfDamage >= otherDamage || distance > otherRange) {
          bestTargets.push({
            damage: selfDamage,
            index,
            target,
          });
        }
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

  smartRandomStrategy() {
    console.log('SmartRandom');
    const characterCells = [...this.game.playerCharacterCells]
      .sort(() => Math.random() - 0.5);
    for (const index of characterCells) {
      this.game.activatePosition(index);
      const saveCells = this.game.transitionСells
        .filter((element) => !this.firingZone.includes(element));
      const moveTarget = getRandomElement(saveCells);
      if (moveTarget) {
        this.game.action = this.game.movePosition;
        this.game.tracedAction(moveTarget);
        return true;
      } else {
        const dangerMove = getRandomElement(this.game.transitionСells);
        this.game.action = this.game.movePosition;
        this.game.tracedAction(dangerMove);
        return true;
      }
    }
    return false;
  }

  randomStrategy() {
    console.log('random');
    const characterCells = [...this.game.playerCharacterCells]
      .sort(() => Math.random() - 0.5);
    for (const index of characterCells) {
      this.game.activatePosition(index);
      const moveTarget = getRandomElement(this.game.transitionСells);
      const attackTarget = getRandomElement(this.game.attackСells);
      if (attackTarget) {
        this.game.action = this.game.attackPosition;
      } else if (moveTarget) {
        this.game.action = this.game.movePosition;
      } else {
        continue;
      }
      this.game.tracedAction(attackTarget || moveTarget);
      return true;
    }
    return false;
  }
}
