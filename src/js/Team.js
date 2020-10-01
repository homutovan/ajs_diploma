import { getTotalPropBySide, changePlayers } from './utils';

export default class Team {
  constructor(positionList) {
    // console.log('constructor Position');
    this.positionList = positionList;
    this.init();
  }

  * [Symbol.iterator]() {
    this.positionList = this.positionList
      .filter((element) => element.character.health > 0);
    this.calcStatistics();
    for (const position of this.positionList) {
      yield position;
    }
  }

  init() {
    this.statistics = {};
    this.initTotalHealth = {};
    this.teamSize = {};
    this.currentTurn = 0;
    this.gameStage = 0;

    for (const side in changePlayers) {
      if (Object.prototype.hasOwnProperty.call(changePlayers, side)) {
        this.initTotalHealth[side] = this.getTotalHealth(side);
        this.teamSize[side] = this.getTeamPosition(side).length;
      }
    }
  }

  getTeamPosition(side) {
    // console.log(side);
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
      timer: this.timer,
    };
    for (const side in changePlayers) {
      if (Object.prototype.hasOwnProperty.call(changePlayers, side)) {
        const numberCharacters = this.getTeamPosition(side).length;
        const numberCharactersEnemy = this.getTeamPosition(changePlayers[side]).length;
        const totalHealth = this.getTotalHealth(side);
        const currTotalHealthEnemy = this.getTotalHealth(changePlayers[side]);
        const totalDamage = this.initTotalHealth[changePlayers[side]] - currTotalHealthEnemy;

        this.statistics[side] = {
          numberCharacters,
          totalHealth,
          totalDamage,
          charactersKilled: this.teamSize[side] - numberCharacters,
          enemiesKilled: this.teamSize[changePlayers[side]] - numberCharactersEnemy,
        };
      }
    }
  }
}
