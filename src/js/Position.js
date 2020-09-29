import { getTotalPropBySide, changePlayers } from './utils';

export default class Position {
  constructor(positionList) {
    this.positionList = positionList;
    this.init();
  }

  [Symbol.iterator]() {
    let current = 0;
    this.positionList = this.positionList
      .filter((element) => element.character.health > 0);
    const last = this.positionList.length;
    const list = this.positionList;
    this.calcStatistics();

    return {
      next() {
        if (current < last) {
          const valueCurrent = list[current];
          current += 1;
          return {
            done: false,
            value: valueCurrent,
          };
        }
        return {
          done: true,
        };
      },
    };
  }

  init() {
    this.statistics = {};
    this.initTotalHealth = {};
    this.teamSize = {};
    this.currentTurn = 0;
    this.gameStage = 0;
    // this.status = true;
    // this.winner = null;

    for (const side in changePlayers) {
      this.initTotalHealth[side] = this.getTotalHealth(side);
      this.teamSize[side] = this.getTeamPosition(side).length;
    }
  }

  getTeamPosition(side) {
    return this.positionList
      .map((element) => element.character.side === side && element.position)
      .filter((element) => element !== false);
  }

  getAllIndex() {
    return [...this.getTeamPosition('good'), ...this.getTeamPosition('evil')];
  }

  getPositionByIndex(index) {
    return this.positionList.find((el) => el.position === index);
  }

  getTotalHealth(side) {
    return getTotalPropBySide(this.positionList, side, 'health');
  }

  calcStatistics() {
    
    this.statistics = { 
      currentTurn: this.currentTurn,
      gameStage: this.gameStage,
    }
    for (const side in changePlayers) {

      const numberCharacters = this.getTeamPosition(side).length;
      const numberCharactersEnemy = this.getTeamPosition(changePlayers[side]).length;
      const currTotalHealth = this.getTotalHealth(side);
      const currTotalHealthEnemy = this.getTotalHealth(changePlayers[side]);
      const totalDamage = this.initTotalHealth[changePlayers[side]] - currTotalHealthEnemy;

      // if (!numberCharacters) {
      //   this.status = false;
      //   this.winner = changePlayers[side];
      // }

      this.statistics[side] = {
        numberCharacters: numberCharacters,
        totalHealth: currTotalHealth,
        totalDamage: totalDamage,
        charactersKilled: this.teamSize[side] - numberCharacters,
        enemiesKilled: this.teamSize[changePlayers[side]] - numberCharactersEnemy,
      }
    }
  }
}
