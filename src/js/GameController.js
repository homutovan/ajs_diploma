import Team from './Team';
import GameState from './GameState';
import Estimator from './Estimator';
import {
  generatePosition,
  generateTeam,
  generateTheme,
} from './generators';
import { getPropagation, changePlayers } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.gamePlay.game = this;
    this.stateService = stateService;
    this.gameState = new GameState(this, stateService);
    this.highscore = this.gameState.highscore || 0;
    this.estimator = new Estimator(this);
    this.saveTeam = [];
    this.timerList = [];
    if (this.stateService.loadStatus) {
      this.loadGame();
    } else {
      this.newGame(12, 20, 'evil', true);
    }
    // console.log(this.timerList);
    // this.timerList.push(2);
    // console.log(this.timerList);
    // this.timerlist.push(setInterval(() => this.timer += 1, 1000));
  }

  init() {
    this.side = this.initialSide;
    this.theme = this.generateTheme.next().value;
    this.fitBoard();
    this.gamePlay.init(this.theme, this.boardSize, this.initialSide);
    this.onCellClick = this.gameState.traceAction(this.click);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(() => this.gamePlay.showModal('newGame'));
    this.gamePlay.addSaveGameListener(() => this.gamePlay.showModal('saveGame'));
    this.gamePlay.addLoadGameListener(() => this.gamePlay.showModal('loadGame'));
    this.gamePlay.addDemoGameListener(() => this.newGame(12, 20, 'evil', true));
    this.timerList.forEach((timer) => clearInterval(timer));
    this.timerList.push(setInterval(() => this.timer += 1, 1000));
    this.generateTeams();
  }

  newGame(boardSize, teamSize, side, demo) {
    // console.log('newGame');
    this.demo = demo;
    this.score = 0;
    this.saveTeam = [];
    this.boardSize = boardSize;
    this.teamSize = teamSize;
    // this.maxCharacterLevel = maxCharacterLevel;
    this.initialSide = side;
    this.side = side;
    this.generateTheme = generateTheme();
    this.gameStage = 1;
    // console.log('end new game');
  }

  loadGame(name = 'autosave') {
    // console.log('loadGame');
    this.gameState.recoverGame(name);
  }

  saveGame(name) {
    this.gameState.saveTurn(name);
  }

  generateTeams() {
    this.playerTeam = generateTeam(
      this.gameStage - 1,
      this.teamSize,
      this.side,
    );

    this.enemyTeam = generateTeam(
      this.gameStage,
      this.teamSize + this.saveTeam.length,
      this.enemySide,
    );

    this.team = new Team([
      ...generatePosition([...this.playerTeam, ...this.saveTeam], this.boardSize, this.initialSide),
      ...generatePosition(this.enemyTeam, this.boardSize, this.initialSide),
    ]);

    // this.team.positionList[0].character.attack = 10000;
    // this.team.positionList[0].character.defense = 10000000000;
    // this.team.positionList[0].character.health = 10000000000;
    // this.team.positionList[0].character.range = 20;
    // this.team.positionList[0].character.distance = 20;
  }

  fitBoard() {
    const capacity = this.boardSize * Math.floor((this.boardSize - 1) ** 0.5);
    const delta = capacity - (this.saveTeam.length + this.teamSize);
    if (delta < 0) {
      this.boardSize -= Math.floor(delta / 2);
    }
  }

  gamePause() {
    this.timerList.forEach((timer) => clearInterval(timer));
    this.demoState = this.demo;
    this.demo = false;
  }

  gameRun() {
    console.log('game run');
    // this.timerList.push(setInterval(() => this.timer += 1, 1000));
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
    this._gameStage = value;
    this.init();
    this.team.highscore = this.highscore;
    this.timer = 0;
    this.turn = 0;
    console.log('end set stage');
  }

  get gameStage() {
    return this._gameStage;
  }

  set turn(value) {
    // console.log('set turn');
    if (value - this._turn === 1) {
      [this.side, this.enemySide] = [this.enemySide, this.side];
    }
    this._turn = value;
    // console.log(this.timerList);
    this.team.currentTurn = this._turn;
    this.team.gameStage = this.gameStage;
    this.team.score = this.score;
    this.playerCharacterCells = this.team.getTeamPosition(this.side);
    this.enemyCharacterCells = this.team.getTeamPosition(this.enemySide);
    this.characterCells = [...this.playerCharacterCells, ...this.enemyCharacterCells];
    this.gamePlay.redrawPositions();
    if (this.checkWinner()) return null;
    this.enemyAction();
    return null;
  }

  get turn() {
    return this._turn;
  }

  set highscore(value) {
    this._highscore = value;
    this.gameState.highscore = value;
  }

  get highscore () {
    return this._highscore;
  }

  checkWinner() {
    if (!this.playerCharacterCells.length * this.enemyCharacterCells.length) {
      const winner = this.team.getPositionByIndex(this.characterCells[0]).character.side;
      if (winner === this.initialSide) {
        this.winPlayer(winner);
      } else {
        this.gameOver();
      }
      return true;
    }
    return false;
  }

 winPlayer(winner) {
  this.score += this.team.getTotalHealth(winner);
  if (this.score > this.highscore) {
    this.highscore = this.score;
  }
  this.gamePlay.showModal('winPlayer');
 }

 gameNext() {
   console.log('next');
  this.saveTeam = this.team.getCharacters();
  this.team.totalLevelUp();
  this.teamSize = this.gameStage - Math.floor(this.gameStage / 3);
  console.log(`team size: ${this.teamSize}`);
  console.log()
  this.gameStage += 1;
 }
 
 gameOver() {
  this.gamePlay.showModal('gameOver');
 }

  enemyAction() {
    // console.log('enemyAction');
    if (this.side === this.estimator.side || this.demo) {
      this.estimator.requestStrategy();
    }
  }

  async click(index) {
    // console.log('click');
    await this.action(index);
  }

  onCellEnter(index) {
    const position = this.team.getPositionByIndex(index);
    if (position) {
      const message = position.getMessage();
      this.gamePlay.showCellTooltip(message, index);
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
