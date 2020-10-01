import {
  calcHealthLevel,
  calcTileType,
  getBoard,
  distanceMetric,
  changePlayers,
  getTimer,
} from './utils';

export default class GamePlay {
  constructor(boardSize, side) {
    this.boardSize = boardSize;
    this.board = getBoard(boardSize);
    this.side = side;
    this.container = null;
    // this.init();
  }

  init(theme) {
    this.boardEl = null;
    this.cells = [];
    this.cellClickListeners = [];
    this.cellEnterListeners = [];
    this.cellLeaveListeners = [];
    this.newGameListeners = [];
    this.saveGameListeners = [];
    this.loadGameListeners = [];
    this.demoGameListeners =[];
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
    this.checkBinding();

    this.container.innerHTML = `
      <div class="operation" id="player">
        <div class="score current-score">0</div>
        <div class="controls">
          <button data-id="action-restart" class="btn">New Game</button>
          <button data-id="action-save" class="btn">Save Game</button>
          <button data-id="action-load" class="btn">Load Game</button>
          <button data-id="action-demo" class="btn">Demo Game</button>
        </div>
        <div class="score high-score">0</div>
      </div>
      <div class="game-info">
        <div class="turn-counter"></div>
        <div class="game-stage"></div>
        <div class="game-timer"></div>
      </div>
      <div class="board-container">
        <div class="sidebar player"></div>
        <div data-id="board" class="board"id="enemy"></div>
        <div class="sidebar enemy"></div>
        <div class="modal" id="modal-new-game"></div>
      </div>
    `;

    this.newGameEl = this.container.querySelector('[data-id=action-restart]');
    this.saveGameEl = this.container.querySelector('[data-id=action-save]');
    this.loadGameEl = this.container.querySelector('[data-id=action-load]');
    this.demoGameEl = this.container.querySelector('[data-id=action-demo]');
    this.modal = this.container.querySelector('.modal');
    console.log(this.modal);
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
    this.addElement(this.sidebarEl, 'title side-title', side);
    this.addElement(this.sidebarEl, 'title stat-title', 'number of characters');
    this[`characterNumber${side}`] = this.addElement(this.sidebarEl, `${side} stats title number-of-characters`, '');
    this.addElement(this.sidebarEl, 'title stat-title', 'total health');
    this[`totalHealth${side}`] = this.addElement(this.sidebarEl, `${side} stats title total-health`, '');
    this.addElement(this.sidebarEl, 'title stat-title', 'total damage');
    this[`totalDamage${side}`] = this.addElement(this.sidebarEl, `${side} stats title total-damage`, '');
    this.addElement(this.sidebarEl, 'title stat-title', 'characters killed');
    this[`charactersKilled${side}`] = this.addElement(this.sidebarEl, `${side} stats title characters-killed`, '');
    this.addElement(this.sidebarEl, 'title stat-title', 'enemies killed');
    this[`enemiesKilled${side}`] = this.addElement(this.sidebarEl, `${side} stats title enemies-killed`, '');
  }

  addElement(parent, cssClass, text) {
    const element = document.createElement('div');
    element.innerText = text;
    element.classList.add(...cssClass.split(' '));
    parent.appendChild(element);
    return element;
  }

  drawModal() {

  }

  /**
   * Draws positions (with chars) on boardEl
   *
   * @param positions array of PositionedCharacter objects
   */
  redrawPositions(positions) {
    for (const cell of this.cells) {
      cell.innerHTML = '';
    }

    for (const position of positions) {
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
    this.updateStatistics(positions.statistics);
  }

  updateStatistics(statistics) {
    const { currentTurn, gameStage } = statistics;
    this.updateSide(statistics.good, 'good');
    this.updateSide(statistics.evil, 'evil');
    this.turnCounter.innerText = `Turn: ${currentTurn}`;
    this.gameStage.innerText = `Stage: ${gameStage}`;
    this.currentScore.innerText = `Score: ${0}`;
    this.highScore.innerText = `Highscore: ${0}`;
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
   * Add listener to "Load Game" button click
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
    console.log(this.cellClickListeners);
    console.log(message);
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
      await this.showDistanceAttack(cellFrom, startX, startY, stopX + toW / 2, stopY + toH / 2, color);
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
    element.style.top = `${startY + deltaY * step}px`;
    element.style.left = `${startX + deltaX * step}px`;
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
    this.boardEl.style.cursor = cursor;
  }

  checkBinding() {
    if (this.container === null) {
      throw new Error('GamePlay not bind to DOM');
    }
  }

  showModal() {
    console.log('asdfa');
    // this.modal.style.display = 'block';
    console.log(this.modal);
  }
}
