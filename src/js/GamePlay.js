import {
  calcHealthLevel,
  calcTileType,
  getBoard,
  distanceMetric,
  changePlayers,
  getTimer,
} from './utils';
 
import cursors from './cursors';
import formSelector from './forms';

export default class GamePlay {
  constructor() {
    this.container = null;
  }

  init(theme, boardSize, side) {
    console.log('gameplay init');
    this.boardSize = boardSize;
    this.board = getBoard(boardSize);
    this.side = side;
    this.boardEl = null;
    this.cells = [];
    this.cellClickListeners = [];
    this.cellEnterListeners = [];
    this.cellLeaveListeners = [];
    this.newGameListeners = [];
    this.saveGameListeners = [];
    this.loadGameListeners = [];
    this.demoGameListeners = [];
    this.drawUi(theme);
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;
  }

  /**
   * Draws boardEl with specific theme
   *
   * @param theme
   */
  drawUi(theme) {
    console.log('drawUi');
    this.checkBinding();
    this.container.innerHTML = formSelector('main');
    this.newGameEl = this.container.querySelector('[data-id=action-restart]');
    this.saveGameEl = this.container.querySelector('[data-id=action-save]');
    this.loadGameEl = this.container.querySelector('[data-id=action-load]');
    this.demoGameEl = this.container.querySelector('[data-id=action-demo]');
    this.modal = this.container.querySelector('.modal');
    this.turnCounter = this.container.querySelector('.turn-counter');
    this.gameStage = this.container.querySelector('.game-stage');
    this.gameTimer = this.container.querySelector('.game-timer');
    this.currentScore = this.container.querySelector('.score.current-score');
    this.highScore = this.container.querySelector('.score.high-score');

    this.drawSidebar(this.side, 'player');
    this.drawSidebar(changePlayers[this.side], 'enemy');
    this.newGameEl.addEventListener('click', (event) => this.onNewGameClick(event));
    this.saveGameEl.addEventListener('click', (event) => this.onSaveGameClick(event));
    this.loadGameEl.addEventListener('click', (event) => this.onLoadGameClick(event));
    this.demoGameEl.addEventListener('click', (event) => this.onDemoGameClick(event));

    this.boardEl = this.container.querySelector('[data-id=board]');
    this.boardEl.style['grid-template-columns'] = `repeat(${this.boardSize}, 1fr)`;

    this.boardEl.classList.add(theme);
    for (let i = 0; i < this.boardSize ** 2; i += 1) {
      const cellEl = document.createElement('div');
      cellEl.classList.add('cell', 'map-tile', `map-tile-${calcTileType(i, this.board)}`);
      cellEl.addEventListener('mouseenter', (event) => this.onCellEnter(event));
      cellEl.addEventListener('mouseleave', (event) => this.onCellLeave(event));
      cellEl.addEventListener('click', (event) => this.onCellClick(event));
      this.boardEl.appendChild(cellEl);
    }
    this.cells = Array.from(this.boardEl.children);
  }

  drawSidebar(side, player) {
    this.sidebarEl = this.container.querySelector(`.sidebar.${player}`);
    this.addElement(this.sidebarEl, 'div', 'title side-title', side);
    this.addElement(this.sidebarEl, 'div', 'title stat-title', 'number of characters');
    this[`characterNumber${side}`] = this.addElement(this.sidebarEl, 'div', `${side} stats title number-of-characters`, '');
    this.addElement(this.sidebarEl, 'div', 'title stat-title', 'total health');
    this[`totalHealth${side}`] = this.addElement(this.sidebarEl, 'div', `${side} stats title total-health`, '');
    this.addElement(this.sidebarEl, 'div', 'title stat-title', 'total damage');
    this[`totalDamage${side}`] = this.addElement(this.sidebarEl, 'div', `${side} stats title total-damage`, '');
    this.addElement(this.sidebarEl, 'div', 'title stat-title', 'characters killed');
    this[`charactersKilled${side}`] = this.addElement(this.sidebarEl, 'div', `${side} stats title characters-killed`, '');
    this.addElement(this.sidebarEl, 'div', 'title stat-title', 'enemies killed');
    this[`enemiesKilled${side}`] = this.addElement(this.sidebarEl, 'div', `${side} stats title enemies-killed`, '');
  }

  addElement(parent, tag, cssClass, text) {
    const element = document.createElement(tag);
    element.innerText = text;
    element.classList.add(...cssClass.split(' '));
    parent.appendChild(element);
    return element;
  }

  /**
   * Draws positions (with chars) on boardEl
   *
   * @param positions array of PositionedCharacter objects
   */
  redrawPositions(positions) {
    // console.log('redrawPositions');
    // console.log(positions);
    for (const cell of this.cells) {
      cell.innerHTML = '';
    }

    for (const position of positions) {
      // console.log(position);
      const cellEl = this.boardEl.children[position.position];
      const charEl = document.createElement('div');
      charEl.classList.add('character', position.character.type);
      const healthEl = document.createElement('div');
      healthEl.classList.add('health-level');
      const healthIndicatorEl = document.createElement('div');
      healthIndicatorEl.classList.add('health-level-indicator',
        `health-level-indicator-${calcHealthLevel(position.character.health)}`);
      healthIndicatorEl.style.width = `${position.character.health}%`;
      healthEl.appendChild(healthIndicatorEl);
      charEl.appendChild(healthEl);
      cellEl.appendChild(charEl);
    }
    this.deselectAll();
    this.updateStatistics(positions.statistics);
  }

  updateStatistics(statistics) {
    console.log(statistics);
    const {
      currentTurn,
      gameStage,
      score,
      highscore,
    } = statistics;
    this.updateSide(statistics.good, 'good');
    this.updateSide(statistics.evil, 'evil');
    this.turnCounter.innerText = `Turn: ${currentTurn}`;
    this.gameStage.innerText = `Stage: ${gameStage}`;
    this.currentScore.innerText = `Score: ${score}`;
    this.highScore.innerText = `Highscore: ${highscore}`;
  }

  updateTimer(timer) {
    this.gameTimer.innerText = `Timer: ${getTimer(timer)}`;
  }

  updateSide(sideStats, side) {
    const {
      numberCharacters,
      totalHealth,
      totalDamage,
      charactersKilled,
      enemiesKilled,
    } = sideStats;
    this[`characterNumber${side}`].innerText = numberCharacters;
    this[`totalHealth${side}`].innerText = totalHealth;
    this[`totalDamage${side}`].innerText = totalDamage;
    this[`charactersKilled${side}`].innerText = charactersKilled;
    this[`enemiesKilled${side}`].innerText = enemiesKilled;
  }

  /**
   * Add listener to mouse enter for cell
   *
   * @param callback
   */
  addCellEnterListener(callback) {
    this.cellEnterListeners.push(callback);
  }

  /**
   * Add listener to mouse leave for cell
   *
   * @param callback
   */
  addCellLeaveListener(callback) {
    this.cellLeaveListeners.push(callback);
  }

  /**
   * Add listener to mouse click for cell
   *
   * @param callback
   */
  addCellClickListener(callback) {
    this.cellClickListeners.push(callback);
  }

  /**
   * Add listener to "New Game" button click
   *
   * @param callback
   */
  addNewGameListener(callback) {
    this.newGameListeners.push(callback);
  }

  /**
   * Add listener to "Save Game" button click
   *
   * @param callback
   */
  addSaveGameListener(callback) {
    this.saveGameListeners.push(callback);
  }

  /**
   * Add listener to "Load Game" button click
   *
   * @param callback
   */
  addLoadGameListener(callback) {
    this.loadGameListeners.push(callback);
  }

  /**
   * Add listener to "Demo Game" button click
   *
   * @param callback
   */
  addDemoGameListener(callback) {
    this.demoGameListeners.push(callback);
  }

  onCellEnter(event) {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget);
    this.cellEnterListeners.forEach((o) => o.call(null, index));
  }

  onCellLeave(event) {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget);
    this.cellLeaveListeners.forEach((o) => o.call(null, index));
  }

  onCellClick(event) {
    const index = this.cells.indexOf(event.currentTarget);
    this.cellClickListeners.forEach((o) => o.call(null, index));
  }

  onNewGameClick(event) {
    event.preventDefault();
    this.newGameListeners.forEach((o) => o.call(null));
  }

  onSaveGameClick(event) {
    event.preventDefault();
    this.saveGameListeners.forEach((o) => o.call(null));
  }

  onLoadGameClick(event) {
    event.preventDefault();
    this.loadGameListeners.forEach((o) => o.call(null));
  }

  onDemoGameClick(event) {
    event.preventDefault();
    this.demoGameListeners.forEach((o) => o.call(null));
  }

  showError(message) {
    alert(message);
  }

  static showMessage(message) {
    alert(message);
  }

  selectCell(index, color = 'yellow') {
    this.deselectCell(index);
    this.cells[index].classList.add('selected', `selected-${color}`);
  }

  deselectCell(index) {
    const cell = this.cells[index];
    cell.classList.remove(...Array.from(cell.classList)
      .filter((o) => o.startsWith('selected')));
  }

  deselectAll() {
    const selected = this.container.querySelectorAll('.selected');
    const entered = this.container.querySelectorAll('.entered');
    [...entered].map((cell) => cell.classList.remove('entered'));
    [...selected].map((cell) => cell.classList.remove(...Array.from(cell.classList)
      .filter((o) => o.startsWith('selected'))));
  }

  enterCell(index) {
    this.cells[index].classList.add('entered');
  }

  leaveCells(index) {
    this.cells[index].classList.remove('entered');
  }

  highlightCell(cells) {
    cells.forEach((i) => this.cells[i].classList.add('highlighted'));
  }

  dehighlightCell() {
    this.cells.forEach((cell) => cell.classList.remove('highlighted'));
  }

  showCellTooltip(message, index) {
    this.cells[index].title = message;
  }

  hideCellTooltip(index) {
    this.cells[index].title = '';
  }

  showDamage(index, damage) {
    return new Promise((resolve) => {
      const cell = this.cells[index];
      const damageEl = document.createElement('span');
      damageEl.textContent = damage;
      damageEl.classList.add('damage');
      cell.appendChild(damageEl);

      damageEl.addEventListener('animationend', () => {
        if (cell.contains(damageEl)) {
          cell.removeChild(damageEl);
        }
        resolve();
      });
    });
  }

  async animateAction(from, to, type, side) {
    const cellFrom = this.cells[from];
    const cellTo = this.cells[to];
    const {
      x: fromX, y: fromY, width: fromW, height: fromH,
    } = cellFrom.getBoundingClientRect();
    const {
      x: toX, y: toY, width: toW, height: toH,
    } = cellTo.getBoundingClientRect();
    const startX = fromW / 2;
    const startY = fromH / 2;
    const stopX = toX - fromX;
    const stopY = toY - fromY;
    const distance = distanceMetric(from, to, this.boardSize);
    if (type === 'attack') {
      await this.showAttack(cellFrom, startX, startY, stopX, stopY, toW, toH, distance, side);
    } else {
      await this.showMoveCharacter(cellFrom, 0, 0, stopX, stopY);
    }
  }

  async showAttack(cellFrom, startX, startY, stopX, stopY, toW, toH, distance, side) {
    const color = side === 'evil' ? 'red' : 'blue';
    if (distance > 1) {
      await this.showDistanceAttack(
        cellFrom,
        startX,
        startY,
        stopX + toW / 2,
        stopY + toH / 2,
        color,
      );
    } else {
      await this.showHandToHandAttack(cellFrom, 0, 0, stopX, stopY);
    }
  }

  async showMoveCharacter(cellFrom, startX, startY, stopX, stopY) {
    const character = cellFrom.querySelector('.character');
    await this.moveElement(character, startX, startY, stopX, stopY, 50);
  }

  async showHandToHandAttack(cellFrom, startX, startY, stopX, stopY) {
    const attacker = cellFrom.querySelector('.character');
    await this.moveElement(attacker, startX, startY, stopX, stopY, 50);
    await this.moveElement(attacker, stopX, stopY, startX, startY, 50);
  }

  async showDistanceAttack(source, startX, startY, stopX, stopY, color) {
    const bulletEl = document.createElement('span');
    bulletEl.classList.add('bullet', color);
    source.appendChild(bulletEl);
    await this.moveElement(bulletEl, startX, startY, stopX, stopY, 50);
  }

  async moveElement(element, startX, startY, stopX, stopY, time) {
    const deltaX = (stopX - startX) / time;
    const deltaY = (stopY - startY) / time;
    await this.moveStep(element, 0, time, startY, deltaY, startX, deltaX);
  }

  async moveStep(element, step, time, startY, deltaY, startX, deltaX) {
    if (element) {
      element.style.top = `${startY + deltaY * step}px`;
      element.style.left = `${startX + deltaX * step}px`;
    }
    if (step < time) {
      return new Promise((resolve) => {
        setTimeout(
          () => resolve(this.moveStep(element, step += 1, time, startY, deltaY, startX, deltaX)),
          1,
        );
      });
    }
    return null;
  }

  setCursor(cursor) {
    this.boardEl.style.cursor = cursors[cursor];
  }

  checkBinding() {
    if (this.container === null) {
      throw new Error('GamePlay not bind to DOM');
    }
  }

  showModal(mode) {
    this.game.gamePause();
    this.game.demo = false;
    this.modal.style.display = 'block';
    // console.log(`saveCont: ${this.saveContainer}`);
    this.createForm(formSelector(mode));
    this.registerEvents();
  }

  closeModal() {
    console.log(this.demoState);
    this.modal.style.display = 'none';
    this.unregisterEvents();
    this.game.gameRun();
  }

  unregisterEvents() {
    this.dismiss.onclick = '';
    this.form.onsubmit = '';
    if (this.boardSizeControl) {
      this.boardSizeControl.onchange = '';
      this.teamSizeControl.onchange = '';
      this.boardSizeControl = '';
      this.teamSizeControl = '';
      this.boardSizeIndicator = '';
      this.teamSizeIndicator = '';
    }
  }

  registerEvents() {
    this.form = this.modal.querySelector('#game-params-form');
    this.dismiss = this.modal.querySelector('button[data-dismiss="modal"]');
    this.boardSizeControl = this.modal.querySelector('#board-size-control');
    // console.log(`this.boardSizeControl: ${this.boardSizeControl}`);
    this.teamSizeControl = this.modal.querySelector('#team-size-control');
    this.boardSizeIndicator = this.modal.querySelector('.board-size');
    this.teamSizeIndicator = this.modal.querySelector('.team-size');
    // console.log(`this.saveContainer: ${this.saveContainer}`);
    this.dismiss.onclick = this.closeModal.bind(this);
    if (this.boardSizeControl) {
      this.boardSizeControl.onchange = this.showBoardSize.bind(this);
      this.teamSizeControl.onchange = this.showTeamSize.bind(this);
      this.form.onsubmit = this.newGame.bind(this);
    } else if (this.saveContainer) {
      this.form.onsubmit = this.saveGame.bind(this);
    } else if (this.loadContainer) {
      this.form.onsubmit = this.loadGame.bind(this);
    }
  }

  eventHandler(event) {
    event.preventDefault();
    return new FormData(this.form);
  }

  newGame(event) {
    const data = this.eventHandler(event);
    const selectSide = data.get('side');
    const selectBoardSize = +data.get('boardSize');
    const selectTeamSize = +data.get('teamSize');
    this.startGame(selectBoardSize, selectTeamSize, 4, selectSide, false);
    // this.closeModal();
  }

  saveGame(event) {
    const data = this.eventHandler(event);
    const name = data.get('save-input');
    this.writeGame(name);
    this.closeModal();
  }

  loadGame(event) {
    const data = this.eventHandler(event);
    const name = data.get('load-input');
    this.readGame(name);
  }

  showBoardSize(event) {
    const { value } = event.target;
    this.boardSizeIndicator.innerText = value;
    this.teamSizeControl.max = 2 * value;
    this.teamSizeIndicator.innerText = this.teamSizeControl.value;
  }

  showTeamSize(event) {
    const { value } = event.target;
    this.teamSizeIndicator.innerText = value;
  }

  createForm(form) {
    this.modal.innerHTML = form;
    // console.log(this.saveContainer);
    this.saveContainer = this.modal.querySelector('.save-container');
    this.loadContainer = this.modal.querySelector('.load-container');
    if (this.saveContainer) {
      this.fillSave(this.saveContainer);
    } else if (this.loadContainer) {
      this.fillLoad(this.loadContainer);
    }
  }

  fillSave(saveContainer) {
    saveContainer.innerHTML = '';
    const saveList = this.stateService.getSaveList();
    for (const save of saveList) {
      const element = this.addElement(saveContainer, 'li', 'save-list-item', '');
      const inner = this.addElement(element, 'div', `save ${save}`, '');
      const saveNameEl = this.addElement(inner, 'div', 'save-name', save);
      const delElement = this.addElement(inner, 'div', 'delete', 'X');
      delElement.addEventListener('click', (event) => {
        const keyName = event.target.parentNode.classList[1];
        this.stateService.delete(keyName);
        this.fillSave(saveContainer);
      });
    }
  }

  fillLoad(loadContainer) {
    loadContainer.innerHTML = '';
    const saveList = this.stateService.getSaveList();
    for (const save of saveList) {
      const element = this.addElement(loadContainer, 'option', 'load-list-item', save);
      // const inner = this.addElement(element, 'div', `save ${save}`, '');
      // const saveNameEl = this.addElement(inner, 'div', 'save-name', save);
      // const delElement = this.addElement(inner, 'div', 'delete', 'X');
      // delElement.addEventListener('click', (event) => {
      //   const keyName = event.target.parentNode.classList[1];
      //   this.stateService.delete(keyName);
      //   this.fillSave(loadContainer);
      // });
    }
  }
}
