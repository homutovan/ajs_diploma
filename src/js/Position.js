export default class Position {
  constructor(positionList) {
    this.positionList = positionList;
  }

  [Symbol.iterator]() {
    let current = 0;
    this.positionList = this.positionList
      .filter((element) => element.character.health > 0);
    const last = this.positionList.length;
    const list = this.positionList;

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
}
