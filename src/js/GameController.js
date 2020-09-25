import themes from './themes';
import cursors from './cursors';
import Position from './Position';
import GameState from './GameState';
import Estimator from './Estimator';
import { generatePosition, generateTeam, typeList } from './generators';
import { getPropagation } from './utils';

export default class GameController {
  constructor(gamePlay, stateService, side) {
    this.gamePlay = gamePlay;
    this.estimator = new Estimator(this);
    this.stateService = stateService;
    this.side = side;
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
    this.typeList = (this.side === 'good') ? typeList : typeList.reverse();
    this.teamPlayer = generateTeam(typeList.slice(0, typeList.length / 2), 4, 12);
    this.teamEnemy = generateTeam(typeList.slice(typeList.length / 2), 4, 5);
    this.position = new Position([
      ...generatePosition(this.teamPlayer, this.gamePlay.boardSize, 'good'),
      ...generatePosition(this.teamEnemy, this.gamePlay.boardSize, 'evil'),
    ]);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    // this.gamePlay.addNewGameListener(this.gamePlay.showModal.bind(this));
    if (this.stateService.loadStatus) {
      this.gameState.objToPosition(this.position);
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
    const { position, action, target } = this.estimator.requestStrategy();
    this.side = 'good';
    // this.activatePosition(position);
    // // this.action = action;
    // // this.onCellClick(target);
    console.log('enemy');
    this.side = 'evil';
  }

  async onCellClick(index) {
    if (this.action.name !== 'activatePosition') {
      this.gameState.traceTurn(index);
      this.turn += 1;
    }
    console.log(index);
    await this.action(index);
  }

  onCellEnter(index) {
    const position = this.position.getPositionByIndex(index);
    
    if (position) {
      const message = position.getMessage();
      this.gamePlay.showCellTooltip(message, index);
    }
    // this.selected.push(index);

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

  attackPosition(index) {
    const position = this.position.getPositionByIndex(index);
    await this.gamePlay.showDamage(position.position, 10);
    position.character.health -= 10;
    this.gamePlay.deselectCell(index);
    this.gamePlay.redrawPositions(this.position);
    this.deactivatePosition();
    this.gamePlay.deselectCell(index);
    // this.selected.forEach((index) => this.gamePlay.deselectCell(index))
    // this.gamePlay.redrawPositions(this.position);
    return this.gamePlay.showDamage(position.position, 10);
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
    this.enemyCharacterCells = this.position.getTeamPosition(this.side === 'good' ? 'evil' : 'good');
    this.transitionСells = getPropagation(index, distance, this.gamePlay.boardSize)
      .filter((element) => !characterCells.includes(element));
    this.attackСells = getPropagation(index, range, this.gamePlay.boardSize)
      .filter((element) => this.enemyCharacterCells.includes(element));
  }
}
