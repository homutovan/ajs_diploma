import themes from './themes';
import cursors from './cursors';
import Position from './Position';
import GameState from './GameState';
import Estimator from './Estimator';
import { generatePosition, generateTeam, typeList } from './generators';
import { getPropagation } from './utils';

export default class GameController {
  constructor(gamePlay, stateService, side) {
    this.side = side;
    this.gamePlay = gamePlay;
    this.estimator = new Estimator(this);
    this.stateService = stateService;
    this.selected = [];
    this.gameState = new GameState(this, stateService);
    this.activePosition = null;
    this.side = side;
    this.transitionСells = [];
    this.attackСells = [];
    this.turn = 0;
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.teamSize = 5;
    this.maxCharacterLevel = 4;

    this.evilTeam = generateTeam(typeList.slice(0, typeList.length / 2), this.maxCharacterLevel, this.teamSize);
    this.goodTeam = generateTeam(typeList.slice(typeList.length / 2), this.maxCharacterLevel, this.teamSize);

    this.position = new Position([
      ...generatePosition(this.goodTeam, this.gamePlay.boardSize, this.side),
      ...generatePosition(this.evilTeam, this.gamePlay.boardSize, this.estimator.side),
    ]);

    this.onCellClick = this.gameState.traceTurn(this.click);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    // this.gamePlay.addNewGameListener(this.gamePlay.showModal.bind(this));
    if (this.stateService.loadStatus) {
      this.gameState.recoverTurn();
    }
    this.gamePlay.redrawPositions(this.position);
  }

  set turn(value) {
    this._turn = value;
    if (this._turn % 2) this.enemy();
  }

  get turn() {
    return this._turn;
  }

  async enemy() {
    this.estimator.requestStrategy();
  }

  async click(index) {
    console.log(`this.turn: ${this.turn}`)
    await this.action(index);
  }

  onCellEnter(index) {
    const position = this.position.getPositionByIndex(index);
    
    if (position) {
      const message = position.getMessage();
      this.gamePlay.showCellTooltip(message, index);
    }

    if (this.activePosition) {
      if (this.transitionСells.includes(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
        this.action = this.movePosition;
      } else if (this.attackСells.includes(index)) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
        this.action = this.attackPosition;
      } else if (this.playerCharacterCells.includes(index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.action = this.activatePosition;
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
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

  movePosition(index) {
    const position = this.activePosition;
    this.deactivatePosition();
    position.position = index;
    this.gamePlay.deselectCell(index);
    this.gamePlay.redrawPositions(this.position);
  }

  async attackPosition(index) {
    const position = this.position.getPositionByIndex(index);
    this.deactivatePosition();
    this.gamePlay.deselectCell(index);
    await this.gamePlay.showDamage(position.position, 10);
    position.character.health -= 10;
    this.gamePlay.redrawPositions(this.position);
  }

  activatePosition(index) {
    this.deactivatePosition();
    const position = this.position.getPositionByIndex(index);
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
      this.gamePlay.setCursor(cursors.auto);
      this.action = this.activatePosition;
      this.activePosition = null;
      this.playerCharacterCells = [];
      this.enemyCharacterCells = [];
      this.transitionСells = [];
    }
  }

  distributionCells(index) {
    const { distance, range } = this.activePosition.character;
    const characterCells = this.position.getAllIndex();
    this.playerCharacterCells = this.position.getTeamPosition(this.side);
    this.enemyCharacterCells = this.position.getTeamPosition(this.estimator.side);
    this.transitionСells = getPropagation(index, distance, this.gamePlay.boardSize)
      .filter((element) => !characterCells.includes(element));
    this.attackСells = getPropagation(index, range, this.gamePlay.boardSize)
      .filter((element) => this.enemyCharacterCells.includes(element));
  }
}
