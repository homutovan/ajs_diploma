import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { characterGenerator, generatePosition, generateTeam, typeList } from './generators';
import { getPropagation } from './utils';

export default class GameController {
  constructor(gamePlay, stateService, side) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.index = 0;
    this.side = side
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.typeList = (this.side === 'good') ? typeList : typeList.reverse();
    this.teamP = generateTeam(typeList.slice(0, typeList.length / 2), 4, 12);
    this.teamE = generateTeam(typeList.slice(typeList.length / 2), 4, 5);
    this.position = [
      ...generatePosition(this.teamP, this.gamePlay.boardSize, 'good'),
      ...generatePosition(this.teamE, this.gamePlay.boardSize, 'evil')
    ];
    this.gamePlay.redrawPositions(this.position);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    const character = this.gamePlay.cells[index].querySelector('.character');
    if (character) {
      const pos = this.position.find((el) => el.position === index);
      if (pos.character.side !== this.side) return;
      this.activeCharachter = pos;
      this.gamePlay.deselectCell(this.index);
      this.gamePlay.selectCell(index);
      const cells = getPropagation(index, pos.character.distance, this.gamePlay.boardSize);
      this.gamePlay.dehighlightCell();
      this.gamePlay.highlightCell(cells);
      this.index = index;
    } else {
      this.activeCharachter.position = index;
      this.gamePlay.redrawPositions(this.position);
      this.gamePlay.deselectCell(this.index);
      this.gamePlay.dehighlightCell();
    }
  }

  onCellEnter(index) {
    this.gamePlay.cells[index].classList.add('entered');
    const character = this.gamePlay.cells[index].querySelector('.character');
    if (!character) return;
    const pos = this.position.find((el) => el.position === index);
    const message = this.prepareMsg(pos.character);
    this.gamePlay.showCellTooltip(message, index);
  }

  onCellLeave(index) {
    this.gamePlay.cells[index].classList.remove('entered');
    this.gamePlay.hideCellTooltip(index);
  }

  prepareMsg(character) {
    return `\u{1F396} ${character.level}`
    + `\n\u{2694} ${character.attack}`
    + `\n\u{1F6E1} ${character.defense}`
    + `\n\u{2764} ${character.health}`;
  }
}
