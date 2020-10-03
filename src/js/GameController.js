import themes from './themes';
import Team from './Team';
import GameState from './GameState';
import Estimator from './Estimator';
import {
  generatePosition,
  generateTeam,
  typeList,
  generateTheme,
} from './generators';
import { getPropagation, changePlayers } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState(this, stateService);
    this.estimator = new Estimator(this);
    if (this.stateService.loadStatus) {
      this.loadGame();
    } else {
      this.newGame(8, 8, 4, 'evil', false);
    }
  }

  init() {
    this.gamePlay.init(this.theme, this.boardSize, this.initialSide);
    this.gamePlay.stateService = this.stateService;
    this.gamePlay.startGame = this.newGame.bind(this);
    this.gamePlay.writeGame = this.saveGame.bind(this);
    this.gamePlay.readGame = this.loadGame.bind(this);
    this.gamePlay.game = this;
    this.onCellClick = this.gameState.traceAction(this.click);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(() => this.gamePlay.showModal('newGame'));
    this.gamePlay.addSaveGameListener(() => this.gamePlay.showModal('saveGame'));
    this.gamePlay.addLoadGameListener(() => this.gamePlay.showModal('loadGame'));
    this.gamePlay.addDemoGameListener(() => this.newGame(16, 32, 12, 'evil', true));
    clearInterval(this.timerId);
    this.timerId = setInterval(() => this.timer += 1, 1000);
  }

  newGame(boardSize, teamSize, maxCharacterLevel, side, demo) {
    console.log('newGame');
    this.demo = demo;
    this.boardSize = boardSize;
    this.teamSize = teamSize;
    this.maxCharacterLevel = maxCharacterLevel;
    this.initialSide = side;
    this.side = side;
    this.generateTheme = generateTheme();
    this.saveTeam = [];
    this.gameStage = 1;
    console.log('end new game');
  }

  loadGame(name = 'autosave') {
    console.log('loadGame');
    this.gameState.recoverGame(name);
  }

  saveGame(name) {
    this.gameState.saveTurn(name);
  }

  generateTeams() {
    this.playerTeam = generateTeam(
      typeList,
      this.maxCharacterLevel,
      this.teamSize,
      this.side,
    );
    this.enemyTeam = generateTeam(
      typeList,
      this.maxCharacterLevel,
      this.teamSize + this.saveTeam.length,
      this.enemySide,
    );
    this.team = new Team([
      ...generatePosition([...this.playerTeam, ...this.saveTeam], this.boardSize, this.initialSide),
      ...generatePosition(this.enemyTeam, this.boardSize, this.initialSide),
    ]);
  }

  gamePause() {
    clearInterval(this.timerId);
    this.demoState = this.demo;
    this.demo = false;
  }

  gameRun() {
    this.timerId = setInterval(() => this.timer += 1, 1000);
    this.demo = this.demoState;
    this.turn = this.turn;
  }

  set initialSide(value) {
    this._initialSide = value;
    this.estimator.side = changePlayers[value];
  }

  get initialSide() {
    return this._initialSide;
  }

  set side(value) {
    this._side = value;
    this.enemySide = changePlayers[value];
  }

  get side() {
    return this._side;
  }

  set timer(value) {
    this._timer = value;
    this.gamePlay.updateTimer(value);
  }

  get timer() {
    return this._timer;
  }

  set gameStage(value) {
    console.log('gameStage');
    this.side = this.initialSide;
    this.theme = this.generateTheme.next().value;
    this.init();
    this.generateTeams();
    this._gameStage = value;
    this.timer = 0;
    this.turn = 0;
    console.log('end set stage');
  }

  get gameStage() {
    return this._gameStage;
  }

  set turn(value) {
    console.log('set turn');
    if (value - this._turn === 1) {
      [this.side, this.enemySide] = [this.enemySide, this.side];
    }
    this._turn = value;
    // console.log(this.team);
    this.team.currentTurn = this._turn;
    this.team.gameStage = this.gameStage;
    // this.characterCells = this.team.getAllIndex();
    this.playerCharacterCells = this.team.getTeamPosition(this.side);
    // console.log(this.side);
    // console.log(this.playerCharacterCells);
    this.enemyCharacterCells = this.team.getTeamPosition(this.enemySide);
    // console.log(this.enemyCharacterCells);
    this.characterCells = [...this.playerCharacterCells, ...this.enemyCharacterCells];
    this.gamePlay.redrawPositions(this.team);
    // console.log('redraw end');
    if (this.checkWinner()) return null;
    // console.log(this.side, this.estimator.side);
    console.log('demo:', this.demo);
    console.log(`curr side: ${this.side}`);
    console.log(`estim side: ${this.estimator.side}`);
    console.log(this.side === this.estimator.side);
    this.enemyAction();
    return null;
  }

  get turn() {
    return this._turn;
  }

  checkWinner() {
    if (!this.playerCharacterCells.length * this.enemyCharacterCells.length) {
      const winner = this.team.getPositionByIndex(this.characterCells[0]).character.side;
      console.log(winner);
      this.team.totalLevelUp();
      this.saveTeam = this.team.getCharacters();
      this.gameStage += 1;
      return true;
    }
    return false;
  }

  enemyAction() {
    console.log('enemyAction');
    // this.blocked = false;
    // console.log('blocked');
    // await this.estimator.requestStrategy();
    // this.blocked = true;
    // console.log('unblocked');
    // setTimeout(() => {
    if (this.side === this.estimator.side || this.demo) {
      this.estimator.requestStrategy();
    }
    // }, 50);
  }

  async click(index) {
    console.log('click');
    await this.action(index);
  }

  onCellEnter(index) {
    const position = this.team.getPositionByIndex(index);
    if (position) {
      const message = position.getMessage();
      this.gamePlay.showCellTooltip(message, index);
    }

    if (this.blocked) {
      this.action = () => this.gamePlay.showError('Управление заблокировано!');
      return null;
    }

    if (this.activePosition) {
      if (this.transitionСells.includes(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor('pointer');
        this.action = this.movePosition;
      } else if (this.attackСells.includes(index)) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor('crosshair');
        this.action = this.attackPosition;
      } else if (this.playerCharacterCells.includes(index)) {
        this.gamePlay.setCursor('pointer');
        this.action = this.activatePosition;
      } else {
        this.gamePlay.setCursor('notallowed');
        this.gamePlay.enterCell(index);
        this.action = () => this.gamePlay.showError('Недоступное действие!');
      }
    } else {
      this.gamePlay.enterCell(index);
      this.action = this.activatePosition;
    }
  }

  onCellLeave(index) {
    this.gamePlay.leaveCells(index);
    this.gamePlay.hideCellTooltip(index);
    this.action = null;
    if (this.activePosition && this.activePosition.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  async movePosition(index) {
    const position = this.activePosition;
    this.deactivatePosition();
    this.gamePlay.deselectCell(index);
    await this.gamePlay.animateAction(position.position, index, 'move');
    position.position = index;
  }

  async attackPosition(index) {
    const position = this.team.getPositionByIndex(index);
    const damage = position.character.getDamage(this.activePosition.character.attack);
    await this.gamePlay.animateAction(this.activePosition.position, index, 'attack', this.side);
    this.deactivatePosition();
    this.gamePlay.deselectCell(index);
    await this.gamePlay.showDamage(index, damage);
  }

  activatePosition(index) {
    this.deactivatePosition();
    const position = this.team.getPositionByIndex(index);
    if (position) {
      if (position.character.side === this.side) {
        this.activePosition = position;
        this.gamePlay.selectCell(index);
        this.distributionCells(index);
        this.gamePlay.highlightCell(this.transitionСells);
      }
    }
  }

  deactivatePosition() {
    if (this.activePosition) {
      this.gamePlay.deselectCell(this.activePosition.position);
      this.gamePlay.dehighlightCell();
      this.gamePlay.setCursor('auto');
      this.action = this.activatePosition;
      this.activePosition = null;
      this.transitionСells = [];
      this.attackСells = [];
    }
  }

  distributionCells(index) {
    const { distance, range } = this.activePosition.character;
    this.transitionСells = getPropagation(index, distance, this.boardSize)
      .filter((element) => !this.characterCells.includes(element));
    this.attackСells = getPropagation(index, range, this.boardSize)
      .filter((element) => this.enemyCharacterCells.includes(element));
  }
}
