export function calcTileType(index, board) {
  const len = board.length;
  return board[(index - (index % len)) / len][index % len];
}

export function getBoard(boardSize) {
  return [
    ['top-left', ...Array(boardSize - 2).fill('top'), 'top-right'],
    ...Array(boardSize - 2).fill(['left', ...Array(boardSize - 2).fill('center'), 'right']),
    ['bottom-left', ...Array(boardSize - 2).fill('bottom'), 'bottom-right'],
  ];
}

export function getPropagation(index, radius, boardSize) {
  const cells = [];
  for (let offset = -radius; offset <= +radius; offset += 1) {
    if (!offset) continue;
    cells.push(index + boardSize * offset);
    if (Math.floor((index + offset) / boardSize) === Math.floor(index / boardSize)) {
      cells.push(index + offset);
      for (const sign of [-1, 1]) {
        cells.push(index + (boardSize + sign) * sign * offset);
      }
    }
  }
  return cells.filter((el) => el >= 0 && el <= boardSize ** 2 - 1);
}

export function calcHealthLevel(health) {
  if (health < 15) return 'critical';
  if (health < 50) return 'normal';
  return 'high';
}
