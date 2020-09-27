import Character from './Character';
import PositionedCharacter from './PositionedCharacter';

export default class GameState {
  constructor(game, driver) {
    this.game = game;
    this.driver = driver;
    this.init();
  }

  init() {
    try {
      this.state = this.driver.load();
    } catch (e) {
      console.log(e);
      this.state = { history: [] };
    }
  }

  traceTurn(trackedFunction) {
    return async (arg) => {
      if (this.game.action.name && this.game.action.name !== 'activatePosition') {
        this.state.currentTurn = this.game.turn;
        this.state.history.push({
          turn: this.game.turn,
          side: this.game.side,
          action: this.game.action.name,
          from: this.game.activePosition.position,
          to: arg,
        });
        await trackedFunction.call(this.game, arg);
        this.saveTurn();
        this.game.turn += 1;
      } else trackedFunction.call(this.game, arg);
    };
  }

  recoverTurn() {
    this.objToPosition(this.game.position);
    this.game.turn = this.state.currentTurn;
  }

  saveTurn() {
    this.state.board = [...this.game.position]
      .map((position) => this.positionToObj(position));
    this.driver.save(this.state);
  }

  getLastTurn() {
    return this.state.history[this.state.history.length - 1];
  }

  positionToObj(position) {
    const obj = { character: {} };
    obj.position = position.position;
    for (const property in position.character) {
      if (Object.prototype.hasOwnProperty.call(position.character, property)) {
        obj.character[property] = position.character[property];
      }
    }
    return obj;
  }

  objToPosition(position) {
    const delta = [...position].length - this.state.board.length;
    const pass = Array(delta).fill({ position: -1, character: { health: 0 } });
    [...position].forEach((pos, i) => this.fitPosition(pos, [...this.state.board, ...pass][i]));
  }

  /* eslint no-param-reassign: "error" */
  fitPosition(position, object) {
    position.position = object.position;
    for (const property in position.character) {
      if (Object.prototype.hasOwnProperty.call(position.character, property)) {
        position.character[property] = object.character[property];
      }
    }
  }
}
