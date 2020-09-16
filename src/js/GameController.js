import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { characterGenerator, typeList } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.position = [new PositionedCharacter(...characterGenerator(typeList, 2), 4)]
    this.gamePlay.redrawPositions(this.position)
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this))
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this))
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    
  }

  onCellEnter(index) {
    this.gamePlay.cells[index].classList.add('entered');
    const character = this.gamePlay.cells[index].querySelector('.character');
    const ch = this.position.find((el) => el.position == index)
    if (ch) console.log(ch.character)
    const message = 'sfdgsdfg'
    if (character) this.gamePlay.showCellTooltip(message, index);

    
  }

  onCellLeave(index) {
    this.gamePlay.cells[index].classList.remove('entered');
    this.gamePlay.hideCellTooltip(index);
  }
}
