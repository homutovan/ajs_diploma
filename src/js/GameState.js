import { changePlayers } from './utils';
import { generateTheme } from './generators';

export default class GameState {
  constructor(game, driver) {
    this.game = game;
    this.driver = driver;
    this.init();
  }

  init(name = 'autosave') {
    try {
      this.state = this.driver.load(name);
    } catch (e) {
      // console.log(e);
      this.state = { history: [] };
    }
  }

  traceAction(trackedFunction) {
    return async (arg) => {
      console.log('traceAction');
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
    this.state.initialSide = this.game.initialSide;
    this.state.side = changePlayers[this.game.side];
    this.state.initTotalHealth = this.game.team.initTotalHealth;
    // this.state.teamSize = this.game.team.teamSize;
    // this.state.statistics = this.game.team.statistics;
    // this.state.maxCharacterLevel = this.game.maxCharacterLevel;
    if (this.state.history.length > 10) {
      this.state.history.shift();
    }
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

  recoverGame(name) {
    console.log('recoverGame');
    if (name !== 'autosave') {
      this.init(name);
    }
    this.game.demo = this.state.demo;
    this.game.boardSize = this.state.boardSize;
    this.game.teamSize = this.state.teamSize;
    this.game.maxCharacterLevel = 1;// this.state.maxCharacterLevel;
    this.game.initialSide = this.state.initialSide;
    this.game.side = this.state.side;
    this.game.generateTheme = generateTheme(this.state.stage - 1);
    this.game.gameStage = this.state.stage;
    this.game.timer = this.state.timer;
    this.objToTeam();
    this.game.turn = this.state.currentTurn + 1;
  }

  saveTurn(name = 'auto') {
    this.state.board = [...this.game.team]
      .map((position) => this.teamToObj(position));
    this.driver.save(this.state, name);
  }

  getLastTurn() {
    return this.state.history[this.state.history.length - 1];
  }

  teamToObj(position) {
    const obj = { character: {} };
    obj.position = position.position;
    for (const property in position.character) {
      if (Object.prototype.hasOwnProperty.call(position.character, property)) {
        obj.character[property] = position.character[property];
      }
    }
    return obj;
  }

  objToTeam() {
    // const charactersNumber = Math.ceil(this.state.board.length) / 2;
    // this.game.teamSize = charactersNumber;
    // this.game.maxCharacterLevel = 1;
    // this.game.generateTeams();
    const { team } = this.game;
    // console.log('getTemplatePosition');
    // console.log(getTemplatePosition(10));
    const delta = [...team].length - this.state.board.length;
    // console.log([...team].length);
    // console.log(delta);
    const pass = Array(delta).fill({ position: -1, character: { health: 0 } });
    [...team].forEach((pos, i) => this.fitTeam(pos, [...this.state.board, ...pass][i]));
    // team.statistics = this.state.statistics;
    team.initTotalHealth = this.state.initTotalHealth;
    team.teamSize = { good: this.state.teamSize, evil: this.state.teamSize };
  }

  /* eslint no-param-reassign: "error" */
  fitTeam(position, object) {
    position.position = object.position;
    for (const property in position.character) {
      if (Object.prototype.hasOwnProperty.call(position.character, property)) {
        position.character[property] = object.character[property];
      }
    }
  }
}
