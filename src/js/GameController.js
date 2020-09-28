import themes from './themes';
import cursors from './cursors';
import Position from './Position';
import GameState from './GameState';
import Estimator from './Estimator';
import { generatePosition, generateTeam, typeList } from './generators';
import { getPropagation } from './utils';

export default class GameController {
  constructor(gamePlay, stateService, side) {
    this.players = { good: 'evil', evil: 'good' };
    this.side = side;
    this.enemySide = this.players[side];
    this.gamePlay = gamePlay;
    this.estimator = new Estimator(this);
    this.stateService = stateService;
    this.gameState = new GameState(this, stateService);
    this.activePosition = null;
    this.teamSize = 20;
    this.maxCharacterLevel = 4;
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.demo = true;

    this.evilTeam = generateTeam(
      typeList.slice(0, typeList.length / 2),
      this.maxCharacterLevel,
      this.teamSize,
    );
    this.goodTeam = generateTeam(
      typeList.slice(typeList.length / 2),
      this.maxCharacterLevel,
      this.teamSize,
    );

    this.position = new Position([
      ...generatePosition(this.goodTeam, this.gamePlay.boardSize, this.side),
      ...generatePosition(this.evilTeam, this.gamePlay.boardSize, this.enemySide),
    ]);

    this.onCellClick = this.gameState.traceTurn(this.click);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    // this.gamePlay.addNewGameListener(this.gamePlay.showModal.bind(this));
    if (this.stateService.loadStatus) {
      this.gameState.recoverTurn();
    } else {
      this.turn = 0;
    }
  }

  set turn(value) {
    if (value && this._turn) {
      [this.side, this.enemySide] = [this.enemySide, this.side];
    }
    this._turn = value;
    this.characterCells = this.position.getAllIndex();
    this.playerCharacterCells = this.position.getTeamPosition(this.side);
    this.enemyCharacterCells = this.position.getTeamPosition(this.enemySide);
    this.gamePlay.redrawPositions(this.position);
    this.gamePlay.updateStatistics(this.gameState.getStatistics());
    if (this.side === this.estimator.side || this.demo) this.enemyAction();
  }

  get turn() {
    return this._turn;
  }

  enemyAction() {
    // setTimeout(() => {
    //   this.estimator.requestStrategy();
    // }, 50);
  }

  async click(index) {
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

  async movePosition(index) {
    const position = this.activePosition;
    await this.gamePlay.animateAction(position.position, index, 'move');
    console.log('dfsf');
    this.deactivatePosition();
    position.position = index;
    this.gamePlay.deselectCell(index);
  }

  async attackPosition(index) {
    const position = this.position.getPositionByIndex(index);
    this.gamePlay.animateAction(this.activePosition.position, index, 'attack', this.side);
    const damage = position.character.getDamage(this.activePosition.character.attack);
    this.deactivatePosition();
    this.gamePlay.deselectCell(index);
    await this.gamePlay.showDamage(index, damage);
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
      this.transitionСells = [];
      this.attackСells = [];
    }
  }

  distributionCells(index) {
    const { distance, range } = this.activePosition.character;
    this.transitionСells = getPropagation(index, distance, this.gamePlay.boardSize)
      .filter((element) => !this.characterCells.includes(element));
    this.attackСells = getPropagation(index, range, this.gamePlay.boardSize)
      .filter((element) => this.enemyCharacterCells.includes(element));
  }
}
