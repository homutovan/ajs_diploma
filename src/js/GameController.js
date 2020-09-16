import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { characterGenerator, generatePosition, typeList } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.index = 0;
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.position = generatePosition([...characterGenerator(typeList, 2), 
      ...characterGenerator(typeList, 3),
      ...characterGenerator(typeList, 4),
      ...characterGenerator(typeList, 4),
    ]);
    this.gamePlay.redrawPositions(this.position);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    const character = this.gamePlay.cells[index].querySelector('.character');
    if (character) {
      this.gamePlay.deselectCell(this.index);
      this.gamePlay.selectCell(index);
      this.index = index;
    }
  }

  onCellEnter(index) {
    this.gamePlay.cells[index].classList.add('entered');
    const character = this.gamePlay.cells[index].querySelector('.character');
    if (character) {
      const ch = this.position.find((el) => el.position === index);
      const message = this.prepareMsg(ch.character);
      this.gamePlay.showCellTooltip(message, index);
    }
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
