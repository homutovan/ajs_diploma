import { getTemplatePosition } from './generators';

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

  traceAction(trackedFunction) {
    return async (arg) => {
      if (this.game.action.name && this.game.action.name !== 'activatePosition') {
        this.fixHistory(arg);
        await trackedFunction.call(this.game, arg);
        this.saveTurn();
        this.game.turn += 1;
      } else trackedFunction.call(this.game, arg);
    };
  }

  fixHistory(arg) {
    this.state.currentTurn = this.game.turn;
    this.state.stage = this.game.gameStage;
    this.state.timer = this.game.timer;
    this.state.boardSize = this.game.boardSize;
    this.state.teamSize = this.game.teamSize;
    this.state.demo = this.game.demo;
    this.state.side = this.game.side;
    this.state.maxCharacterLevel = this.game.maxCharacterLevel;
    this.state.history.push({
      stage: this.game.gameStage,
      turn: this.game.turn,
      timer: this.game.timer,
      side: this.game.side,
      action: this.game.action.name,
      from: this.game.activePosition.position,
      to: arg,
    });
  }

  recoverGame() {
    console.log('recoverGame');
    this.game.boardSize = this.state.boardSize;
    this.game.teamSize = this.state.teamSize;
    this.game.maxCharacterLevel = this.state.maxCharacterLevel;
    this.game.demo = this.state.demo;
    this.game.side = this.state.side
    this.game.gameStage = this.state.stage;
    this.game.turn = this.state.currentTurn;
    this.game.timer = this.state.timer;
    this.objToPosition();
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

  objToPosition() {
    // const charactersNumber = Math.ceil(this.state.board.length) / 2;
    // this.game.teamSize = charactersNumber;
    // this.game.maxCharacterLevel = 1;
    // this.game.generateTeams();
    const { position } = this.game;
    // console.log('getTemplatePosition');
    // console.log(getTemplatePosition(10));
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
