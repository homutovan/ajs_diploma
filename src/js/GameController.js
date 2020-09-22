import themes from './themes';
import cursors from './cursors';
import Position from './Position';
import { generatePosition, generateTeam, typeList } from './generators';
import { getPropagation } from './utils';

export default class GameController {
  constructor(gamePlay, stateService, side) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.side = side;
    this.transitionСells = [];
    this.attackСells = [];
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
    this.gamePlay.redrawPositions(this.position);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    // this.gamePlay.addNewGameListener(this.gamePlay.showModal.bind(this));
  }

  onCellClick(index) {
    const position = this.position.getPositionByIndex(index);
    if (position) {
      const { character } = position;
      if (character.side === this.side) {
        this.activatePosition(position);
      } else if (this.attackСells.includes(index)) {
        this.attackPosition(position);
      }
    } else if (this.activePosition && this.transitionСells.includes(index)) {
      this.movePosition(index);
    }
  }

  activatePosition(position) {
    const { position: index } = position;
    this.deactivatePosition(this.activePosition ? this.activePosition.position : 0);
    this.activePosition = position;
    this.gamePlay.selectCell(index);
    this.distributionCells(index);
    this.gamePlay.dehighlightCell();
    this.gamePlay.highlightCell(this.transitionСells);
  }

  movePosition(index) {
    this.deactivatePosition(this.activePosition.position);
    this.deactivatePosition(index);
    this.activePosition.position = index;
    this.gamePlay.redrawPositions(this.position);
    this.gamePlay.dehighlightCell();
  }

  attackPosition(position) {
    position.character.health -= 10;
    this.gamePlay.showDamage(position.position, 10)
      .then(() => {
        // this.deactivatePosition(this.activePosition);
        this.gamePlay.redrawPositions(this.position);
      });
  }

  deactivatePosition(index) {
    this.gamePlay.deselectCell(index);
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

  onCellEnter(index) {
    if (this.activePosition) {
      if (this.transitionСells.includes(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      } else if (this.attackСells.includes(index)) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
      } else if (this.playerCharacterCells.includes(index)) {
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
        this.gamePlay.enterCell(index);
      }
    } else {
      this.gamePlay.enterCell(index);
    }
    const position = this.position.getPositionByIndex(index);

    if (position) {
      const message = position.getMessage();
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.leaveCells(index);
    this.gamePlay.hideCellTooltip(index);
    if (this.activePosition && this.activePosition.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }
}
